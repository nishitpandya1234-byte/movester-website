import React, { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'

function PhoneStep({ triggered }) {
  const { posY } = useSpring({
    posY: triggered ? [0, 0.3, 0, -0.1, 0] : [0],
    config: { tension: 250, friction: 15 }
  })
  const { scale } = useSpring({
    scale: triggered ? 1.4 : 1.0,
    config: { tension: 300, friction: 10 },
    loop: triggered ? { reverse: true } : false
  })

  return (
    <group>
      {/* Phone body */}
      <animated.group position-y={triggered ? 0 : 0}>
        <mesh>
          <boxGeometry args={[0.8, 1.5, 0.1]} />
          <meshStandardMaterial color="#161614" roughness={0.4} />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[0.65, 1.25, 0.01]} />
          <meshStandardMaterial color="#1a3a6a" emissive="#1a2a4a" emissiveIntensity={0.4} />
        </mesh>
        {/* Notification dot */}
        <animated.mesh position={[0.35, 0.7, 0.08]} scale={scale}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#25D366" emissive="#25D366" emissiveIntensity={0.8} />
        </animated.mesh>
      </animated.group>
    </group>
  )
}

function DocumentStep({ triggered }) {
  const lines = [0.3, 0.05, -0.2]
  const springs = lines.map((_, i) =>
    useSpring({
      scaleX: triggered ? 1 : 0,
      delay: triggered ? i * 150 : 0,
      config: { tension: 200, friction: 20 }
    })
  )
  const { checkScale } = useSpring({
    checkScale: triggered ? 1 : 0,
    delay: triggered ? 500 : 0,
    config: { tension: 220, friction: 18 }
  })

  return (
    <group>
      {/* Clipboard base */}
      <mesh>
        <boxGeometry args={[1.2, 1.6, 0.1]} />
        <meshStandardMaterial color="#F7F1E5" roughness={0.8} />
      </mesh>
      {/* Clip at top */}
      <mesh position={[0, 0.85, 0.06]}>
        <boxGeometry args={[0.35, 0.2, 0.05]} />
        <meshStandardMaterial color="#888" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Text lines */}
      {lines.map((y, i) => (
        <animated.mesh key={i} position={[0, y, 0.06]} scale-x={springs[i].scaleX}>
          <boxGeometry args={[0.8, 0.08, 0.02]} />
          <meshStandardMaterial color="#7A7670" />
        </animated.mesh>
      ))}
      {/* Checkmark circle */}
      <animated.group position={[0.3, -0.5, 0.12]} scale={checkScale}>
        <mesh>
          <circleGeometry args={[0.2, 24]} />
          <meshStandardMaterial color="#2D4A3E" />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[0.1, 0.04, 0.01]} />
          <meshStandardMaterial color="#F7F1E5" />
        </mesh>
        <mesh position={[-0.04, -0.04, 0.01]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.14, 0.04, 0.01]} />
          <meshStandardMaterial color="#F7F1E5" />
        </mesh>
      </animated.group>
    </group>
  )
}

function TruckMiniStep({ triggered }) {
  const { truckX } = useSpring({
    truckX: triggered ? 1.5 : -1.8,
    config: { tension: 80, friction: 20 }
  })
  const { heartScale } = useSpring({
    heartScale: triggered ? 1.2 : 0,
    delay: triggered ? 1200 : 0,
    config: { tension: 300, friction: 10 },
    loop: triggered ? { reverse: true } : false
  })
  const wheelRef = useRef(0)

  useFrame((state, delta) => {
    wheelRef.current += delta
  })

  return (
    <group>
      {/* Road */}
      <mesh position={[0, -0.8, 0]}>
        <boxGeometry args={[5, 0.08, 1.2]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      {/* Mini truck */}
      <animated.group position-x={truckX} position-y={-0.35} scale={0.55}>
        <mesh position={[-0.6, 0, 0]}>
          <boxGeometry args={[1.8, 1.0, 0.9]} />
          <meshStandardMaterial color="#F7F1E5" roughness={0.7} />
        </mesh>
        <mesh position={[0.8, -0.05, 0]}>
          <boxGeometry args={[0.9, 0.8, 0.9]} />
          <meshStandardMaterial color="#D14D2B" roughness={0.6} />
        </mesh>
        {[[-1.0, -0.55, 0.5], [-1.0, -0.55, -0.5], [0.6, -0.55, 0.5], [0.6, -0.55, -0.5]].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.14, 10]} />
            <meshStandardMaterial color="#161614" />
          </mesh>
        ))}
      </animated.group>
      {/* House */}
      <group position={[2.5, -0.4, 0]} scale={0.5}>
        <mesh>
          <boxGeometry args={[1.2, 0.9, 0.9]} />
          <meshStandardMaterial color="#2D4A3E" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <coneGeometry args={[0.9, 0.6, 4]} />
          <meshStandardMaterial color="#D14D2B" roughness={0.6} />
        </mesh>
      </group>
      {/* Heart */}
      <animated.mesh position={[2.5, 0.5, 0]} scale={heartScale}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#D14D2B" emissive="#D14D2B" emissiveIntensity={0.5} />
      </animated.mesh>
    </group>
  )
}

function StepScene({ step, triggered }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 3]} intensity={1.2} />
      {step === 1 && <PhoneStep triggered={triggered} />}
      {step === 2 && <DocumentStep triggered={triggered} />}
      {step === 3 && <TruckMiniStep triggered={triggered} />}
    </>
  )
}

export default function HowItWorksStep({ step = 1, triggered = false }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop="always"
      camera={{ position: [0, 0, 6], fov: 55 }}
      style={{ width: '180px', height: '180px' }}
    >
      <Suspense fallback={null}>
        <StepScene step={step} triggered={triggered} />
      </Suspense>
    </Canvas>
  )
}
