import React, { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'

let webglSupported = null
function isWebGLSupported() {
  if (webglSupported !== null) return webglSupported
  try {
    const canvas = document.createElement('canvas')
    webglSupported = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    webglSupported = false
  }
  return webglSupported
}

class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error) {
    console.warn('3D scene failed to render, showing fallback:', error)
    this.props.onError?.()
  }
  render() {
    return this.state.hasError ? null : this.props.children
  }
}

/**
 * Drop-in replacement for r3f's <Canvas> that:
 *  - Skips straight to `fallback` when the browser can't create a WebGL
 *    context at all (older hardware, software rendering, GPU disabled) —
 *    visitors without WebGL still see something polished instead of a gap.
 *  - Only mounts the WebGL context while the scene is near the viewport,
 *    and unmounts (freeing the context) once it scrolls away. Browsers cap
 *    simultaneous WebGL contexts (~8-16) — this site has ~10 separate
 *    <Canvas> scenes, so keeping them all mounted exhausts that cap and
 *    throws "Error creating WebGL context", crashing the whole React tree.
 *  - Wraps the canvas in an error boundary so a context failure on any
 *    single scene falls back gracefully instead of taking down the page.
 */
export default function Canvas3D({ style, children, fallback = null, ...canvasProps }) {
  const wrapperRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [failed, setFailed] = useState(false)
  const supported = isWebGLSupported()

  useEffect(() => {
    if (!supported) return
    const el = wrapperRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '200px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [supported])

  const showFallback = !supported || failed

  return (
    <div ref={wrapperRef} style={style}>
      {showFallback ? (
        fallback
      ) : (
        visible && (
          <CanvasErrorBoundary onError={() => setFailed(true)}>
            <Canvas {...canvasProps} style={{ width: '100%', height: '100%' }}>
              {children}
            </Canvas>
          </CanvasErrorBoundary>
        )
      )}
    </div>
  )
}
