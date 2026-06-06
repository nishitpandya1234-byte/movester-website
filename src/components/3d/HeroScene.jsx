import React, { useRef, useEffect, useMemo, Suspense, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768

function Road() {
  const dashCount = 20
  return (
    <group>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[60, 0.1, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>
      {Array.from({ length: dashCount }).map((_, i) => (
        <mesh key={i} position={[-30 + i * 3.2 + 1.6, 0.01, 0]}>
          <boxGeometry args={[1.6, 0.02, 0.12]} />
          <meshStandardMaterial color="#f0c040" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, -0.08, 4.1]} receiveShadow>
        <boxGeometry args={[60, 0.06, 0.15]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh position={[0, -0.08, -4.1]} receiveShadow>
        <boxGeometry args={[60, 0.06, 0.15]} />
        <meshStandardMaterial color="#888" />
      </mesh>
    </group>
  )
}

function SmokeParticles({ exhaustRef }) {
  const pointsRef = useRef()
  const count = 30
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.4
      pos[i * 3 + 1] = Math.random() * 3
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4
    }
    return pos
  }, [])

  const speeds = useMemo(() => Array.from({ length: count }, () => 0.01 + Math.random() * 0.02), [])
  const posRef = useRef(positions.slice())

  useFrame(() => {
    if (!pointsRef.current) return
    const arr = pointsRef.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i]
      if (arr[i * 3 + 1] > 3.5) {
        arr[i * 3] = (Math.random() - 0.5) * 0.4
        arr[i * 3 + 1] = 0
        arr[i * 3 + 2] = (Math.random() - 0.5) * 0.4
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef} position={[1.5, 1.8, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(posRef.current), 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#aaaaaa" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

function Truck({ truckRef, wheelsRef }) {
  return (
    <group ref={truckRef} position={[-25, 0.6, 0]} castShadow>
      {/* Cargo box */}
      <mesh position={[-0.9, 0.1, 0]} castShadow>
        <boxGeometry args={[4, 2.2, 2.2]} />
        <meshStandardMaterial color="#F7F1E5" roughness={0.7} />
      </mesh>
      {/* Movester text on side */}
      <Text
        position={[-0.9, 0.1, 1.12]}
        fontSize={0.3}
        color="#D14D2B"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/frauncesdisplay/v29/GFDuW3-BVebkexm-xyF24g_U.woff2"
      >
        MOVESTER
      </Text>
      {/* Cab */}
      <mesh position={[1.9, 0, 0]} castShadow>
        <boxGeometry args={[1.8, 1.8, 2.2]} />
        <meshStandardMaterial color="#D14D2B" roughness={0.6} />
      </mesh>
      {/* Roof accent */}
      <mesh position={[1.9, 1.1, 0]}>
        <boxGeometry args={[1.8, 0.12, 2.2]} />
        <meshStandardMaterial color="#2D4A3E" roughness={0.5} />
      </mesh>
      {/* Windshield */}
      <mesh position={[2.75, 0.1, 0]}>
        <boxGeometry args={[0.05, 1.1, 1.8]} />
        <meshStandardMaterial color="#90bcd4" transparent opacity={0.6} />
      </mesh>
      {/* Exhaust pipe */}
      <mesh position={[1.0, 1.25, -0.8]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      {/* Wheels */}
      <group ref={wheelsRef}>
        {[[-2.2, -1.1, 1.2], [-2.2, -1.1, -1.2], [1.6, -1.1, 1.2], [1.6, -1.1, -1.2]].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.3, 16]} />
            <meshStandardMaterial color="#161614" roughness={0.8} />
          </mesh>
        ))}
        {/* Hubcaps */}
        {[[-2.2, -1.1, 1.36], [-2.2, -1.1, -1.36], [1.6, -1.1, 1.36], [1.6, -1.1, -1.36]].map(([x, y, z], i) => (
          <mesh key={`h${i}`} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.05, 16]} />
            <meshStandardMaterial color="#ccc" metalness={0.5} roughness={0.3} />
          </mesh>
        ))}
      </group>
      {/* Headlights */}
      <mesh position={[2.81, 0.15, 0.7]}>
        <boxGeometry args={[0.05, 0.2, 0.35]} />
        <meshStandardMaterial color="#fffbe0" emissive="#fffbe0" emissiveIntensity={2} />
      </mesh>
      <mesh position={[2.81, 0.15, -0.7]}>
        <boxGeometry args={[0.05, 0.2, 0.35]} />
        <meshStandardMaterial color="#fffbe0" emissive="#fffbe0" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

function PhysicsBoxes({ show }) {
  const boxesRef = useRef([])
  const velocitiesRef = useRef([])
  const positions = useMemo(() => [
    [0.5, 8, 0.3], [-1, 9, -0.4], [1.2, 10, 0.6], [-0.3, 11, 0.1]
  ], [])
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (show && !active) {
      setActive(true)
      velocitiesRef.current = positions.map(() => ({
        vx: (Math.random() - 0.5) * 0.05,
        vy: -0.08,
        vz: (Math.random() - 0.5) * 0.05,
      }))
    }
  }, [show])

  useFrame(() => {
    if (!active) return
    boxesRef.current.forEach((mesh, i) => {
      if (!mesh) return
      const v = velocitiesRef.current[i]
      mesh.position.x += v.vx
      mesh.position.y += v.vy
      mesh.position.z += v.vz
      v.vy += 0.003
      mesh.rotation.x += 0.02
      mesh.rotation.y += 0.015
      if (mesh.position.y <= 0.5) {
        mesh.position.y = 0.5
        v.vy *= -0.3
        v.vx *= 0.8
        v.vz *= 0.8
      }
    })
  })

  if (!active) return null

  return (
    <>
      {positions.map(([x, y, z], i) => (
        <group key={i} ref={el => (boxesRef.current[i] = el)} position={[x, y, z]}>
          <mesh>
            <boxGeometry args={[0.7, 0.7, 0.7]} />
            <meshStandardMaterial color="#C8A06B" roughness={0.9} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.74, 0.74, 0.74]} />
            <meshStandardMaterial color="#a0804a" wireframe />
          </mesh>
        </group>
      ))}
    </>
  )
}

function CameraParallax() {
  const { camera } = useThree()
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 3 })

  useEffect(() => {
    const handleMouse = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  useFrame(() => {
    targetRef.current.x += (mouseRef.current.x * 1.0 - targetRef.current.x) * 0.05
    targetRef.current.y += (3 - mouseRef.current.y * 0.5 - targetRef.current.y) * 0.05
    camera.position.x += (targetRef.current.x - camera.position.x) * 0.05
    camera.position.y += (targetRef.current.y - camera.position.y) * 0.05
  })

  return null
}

function Scene() {
  const truckRef = useRef()
  const wheelsRef = useRef()
  const [boxesActive, setBoxesActive] = useState(false)
  const mobile = isMobile()

  useEffect(() => {
    if (!truckRef.current) return
    const tl = gsap.timeline()
    tl.to(truckRef.current.position, {
      x: 0,
      duration: 2,
      ease: 'power2.out',
      onComplete: () => {
        if (!mobile) setBoxesActive(true)
      }
    })
  }, [])

  useFrame((state, delta) => {
    if (!wheelsRef.current) return
    wheelsRef.current.children.forEach((child, i) => {
      if (i < 4) child.rotation.y += delta * 3
    })
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[3, 1, 1.2]} color="#D14D2B" intensity={0.8} />
      <pointLight position={[3, 1, -1.2]} color="#D14D2B" intensity={0.8} />
      <Road />
      <Truck truckRef={truckRef} wheelsRef={wheelsRef} />
      <SmokeParticles />
      {!mobile && <PhysicsBoxes show={boxesActive} />}
      <CameraParallax />
    </>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 3, 12], fov: 55 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
