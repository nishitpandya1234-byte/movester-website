import React, { useRef, useMemo, Suspense, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import Canvas3D from './Canvas3D'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function DriftingBox({ position, speed, phase }) {
  const meshRef = useRef()
  const time = useRef(phase)

  useFrame((state, delta) => {
    time.current += delta * speed
    if (meshRef.current) {
      meshRef.current.position.x = position[0] + Math.sin(time.current * 0.7) * 0.8
      meshRef.current.position.y = position[1] + Math.sin(time.current * 0.5 + 1.2) * 0.6
      meshRef.current.position.z = position[2] + Math.sin(time.current * 0.3 + 2.4) * 0.5
      meshRef.current.rotation.x += delta * speed * 0.3
      meshRef.current.rotation.y += delta * speed * 0.2
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color="#F7F1E5" transparent opacity={0.15} roughness={0.8} />
    </mesh>
  )
}

function CameraScroll({ sectionRef }) {
  const { camera } = useThree()

  useEffect(() => {
    if (!sectionRef?.current) return

    const tween = gsap.to(camera.position, {
      z: 4,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    })

    return () => {
      tween.scrollTrigger?.kill()
    }
  }, [camera, sectionRef])

  return null
}

const boxData = Array.from({ length: 60 }, (_, i) => ({
  position: [
    (Math.random() - 0.5) * 30,
    (Math.random() - 0.5) * 16,
    (Math.random() - 0.5) * 15 - 5
  ],
  speed: 0.2 + Math.random() * 0.3,
  phase: Math.random() * Math.PI * 2,
}))

function Scene({ sectionRef }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.4} color="#F7F1E5" />
      {boxData.map((data, i) => (
        <DriftingBox key={i} {...data} />
      ))}
      <CameraScroll sectionRef={sectionRef} />
    </>
  )
}

export default function ParticleField({ sectionRef }) {
  return (
    <Canvas3D
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <Scene sectionRef={sectionRef} />
      </Suspense>
    </Canvas3D>
  )
}
