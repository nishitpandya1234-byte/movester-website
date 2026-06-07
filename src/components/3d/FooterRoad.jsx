import React, { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import Canvas3D from './Canvas3D'
import SceneFallback from './SceneFallback'

function LoopingRoad() {
  const truckRef = useRef()
  const dashOffset = useRef(0)
  const dashRefs = useRef([])

  useFrame((state, delta) => {
    // Move truck
    if (truckRef.current) {
      truckRef.current.position.x += 0.06
      if (truckRef.current.position.x > 8) {
        truckRef.current.position.x = -8
      }
    }
    // Animate center line dashes by shifting positions
    dashOffset.current -= 0.06
    if (dashOffset.current < -1.5) dashOffset.current += 1.5
    dashRefs.current.forEach((dash, i) => {
      if (dash) {
        dash.position.x = (-8 + i * 1.5 + 0.75 + dashOffset.current + 100) % 16 - 8
      }
    })
  })

  return (
    <>
      <ambientLight intensity={0.3} />
      <spotLight
        position={[2, 2, 3]}
        angle={0.4}
        intensity={2}
        color="#fffbe0"
        penumbra={0.5}
        target-position={[5, 0, 0]}
      />
      {/* Dark road */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[24, 0.1, 2.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Center line dashes */}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh
          key={i}
          ref={el => (dashRefs.current[i] = el)}
          position={[-8 + i * 1.5 + 0.75, 0.06, 0]}
        >
          <boxGeometry args={[0.7, 0.02, 0.1]} />
          <meshStandardMaterial color="#f0c040" emissive="#f0c040" emissiveIntensity={0.2} />
        </mesh>
      ))}
      {/* Mini truck */}
      <group ref={truckRef} position={[-8, 0.25, 0]} scale={0.42}>
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
          <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.12, 10]} />
            <meshStandardMaterial color="#161614" />
          </mesh>
        ))}
        {/* Headlight point light */}
        <pointLight position={[1.4, 0, 0]} color="#fffbe0" intensity={1.5} distance={4} />
        {/* Headlight mesh */}
        <mesh position={[1.22, -0.05, 0]}>
          <boxGeometry args={[0.04, 0.1, 0.5]} />
          <meshStandardMaterial color="#fffbe0" emissive="#fffbe0" emissiveIntensity={3} />
        </mesh>
      </group>
    </>
  )
}

export default function FooterRoad() {
  return (
    <Canvas3D
      dpr={[1, 1.5]}
      frameloop="always"
      camera={{ position: [0, 1.2, 6], fov: 40 }}
      style={{ width: '100%', height: '80px' }}
      fallback={<SceneFallback icon="🛣️" />}
    >
      <Suspense fallback={null}>
        <LoopingRoad />
      </Suspense>
    </Canvas3D>
  )
}
