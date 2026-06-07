import React, { useRef, useMemo, Suspense, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import Canvas3D from './Canvas3D'
import SceneFallback from './SceneFallback'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

function Confetti({ active }) {
  const pointsRef = useRef()
  const count = 40
  const positions = useMemo(() => new Float32Array(count * 3), [])
  const velocities = useMemo(() => Array.from({ length: count }, () => ({
    vx: (Math.random() - 0.5) * 0.15,
    vy: 0.1 + Math.random() * 0.15,
    vz: (Math.random() - 0.5) * 0.1,
    age: 0,
  })), [])
  const colors = useMemo(() => {
    const c = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const isTerra = Math.random() > 0.5
      if (isTerra) { c[i*3]=0.82; c[i*3+1]=0.3; c[i*3+2]=0.17 }
      else { c[i*3]=0.97; c[i*3+1]=0.94; c[i*3+2]=0.9 }
    }
    return c
  }, [])

  const activeRef = useRef(false)
  useEffect(() => {
    if (active && !activeRef.current) {
      activeRef.current = true
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = 0
        velocities[i].age = 0
      }
    }
  }, [active])

  useFrame((state, delta) => {
    if (!activeRef.current || !pointsRef.current) return
    const arr = pointsRef.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      velocities[i].age += delta
      velocities[i].vy -= delta * 0.2
      arr[i * 3] += velocities[i].vx * delta * 60
      arr[i * 3 + 1] += velocities[i].vy * delta * 60
      arr[i * 3 + 2] += velocities[i].vz * delta * 60
      if (arr[i * 3 + 1] < -1.5 || velocities[i].age > 2) {
        arr[i * 3] = (Math.random() - 0.5) * 1
        arr[i * 3 + 1] = -10
        arr[i * 3 + 2] = 0
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  if (!active) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.12} vertexColors sizeAttenuation />
    </points>
  )
}

function MiniTruck({ progress }) {
  const { truckX } = useSpring({
    truckX: -5 + progress * 9,
    config: { tension: 60, friction: 18 }
  })

  const wheelRotRef = useRef(0)
  const prevProgress = useRef(progress)

  useFrame((state, delta) => {
    wheelRotRef.current += (progress - prevProgress.current) * 20
    prevProgress.current = progress
  })

  return (
    <animated.group position-x={truckX} position-y={0.3} scale={0.55}>
      {/* Cargo */}
      <mesh position={[-0.6, 0, 0]}>
        <boxGeometry args={[1.8, 0.9, 0.9]} />
        <meshStandardMaterial color="#F7F1E5" roughness={0.7} />
      </mesh>
      {/* Cab */}
      <mesh position={[0.75, -0.05, 0]}>
        <boxGeometry args={[0.9, 0.75, 0.9]} />
        <meshStandardMaterial color="#D14D2B" roughness={0.6} />
      </mesh>
      {/* Wheels */}
      {[[-0.9, -0.52, 0.5], [-0.9, -0.52, -0.5], [0.55, -0.52, 0.5], [0.55, -0.52, -0.5]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, wheelRotRef.current]}>
          <cylinderGeometry args={[0.22, 0.22, 0.12, 10]} />
          <meshStandardMaterial color="#161614" />
        </mesh>
      ))}
      {/* Headlight */}
      <mesh position={[1.22, -0.05, 0]}>
        <boxGeometry args={[0.04, 0.1, 0.5]} />
        <meshStandardMaterial color="#fffbe0" emissive="#fffbe0" emissiveIntensity={2} />
      </mesh>
    </animated.group>
  )
}

function Scene({ progress }) {
  const isComplete = progress >= 0.95

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 3]} intensity={1.0} />
      {/* Road */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[20, 0.1, 2]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      {/* Center line dashes */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[-8 + i * 1.5, 0.01, 0]}>
          <boxGeometry args={[0.7, 0.02, 0.06]} />
          <meshStandardMaterial color="#f0c040" />
        </mesh>
      ))}
      {/* House at end */}
      <group position={[5.5, 0.3, 0]} scale={0.5}>
        <mesh>
          <boxGeometry args={[1.2, 0.9, 0.9]} />
          <meshStandardMaterial color="#2D4A3E" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <coneGeometry args={[0.85, 0.6, 4]} />
          <meshStandardMaterial color="#D14D2B" roughness={0.6} />
        </mesh>
      </group>
      <MiniTruck progress={progress} />
      <Confetti active={isComplete} />
    </>
  )
}

export default function FormTruck({ progress = 0 }) {
  return (
    <Canvas3D
      dpr={[1, 1.5]}
      frameloop="always"
      camera={{ position: [0, 1, 8], fov: 35 }}
      style={{ width: '100%', height: '90px' }}
      fallback={<SceneFallback icon="🚚" />}
    >
      <Suspense fallback={null}>
        <Scene progress={progress} />
      </Suspense>
    </Canvas3D>
  )
}
