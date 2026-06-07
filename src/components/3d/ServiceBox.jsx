import React, { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import Canvas3D from './Canvas3D'
import SceneFallback from './SceneFallback'

const FALLBACK_ICONS = { apartment: '🏢', house: '🏠', office: '💼', student: '🎓' }
import { useSpring, animated } from '@react-spring/three'

function BoxFlaps({ isHovered }) {
  const cfg = { tension: 160, friction: 22 }
  const { fr } = useSpring({ fr: isHovered ? Math.PI * 0.72 : 0, config: cfg })
  const { br } = useSpring({ br: isHovered ? -Math.PI * 0.72 : 0, config: cfg })
  const { lr } = useSpring({ lr: isHovered ? Math.PI * 0.68 : 0, delay: isHovered ? 60 : 0, config: cfg })
  const { rr } = useSpring({ rr: isHovered ? -Math.PI * 0.68 : 0, delay: isHovered ? 60 : 0, config: cfg })

  const light = '#C8A06B'
  const dark  = '#B38850'

  return (
    <>
      {/* Front flap — pivot at z=+1 top edge */}
      <group position={[0, 1.04, 1.04]}>
        <animated.group rotation-x={fr}>
          <mesh position={[0, 0, -0.5]}>
            <boxGeometry args={[2.06, 0.07, 1.0]} />
            <meshStandardMaterial color={light} roughness={0.9} />
          </mesh>
          {/* Fold crease */}
          <mesh position={[0, 0.04, -0.98]}>
            <boxGeometry args={[2.06, 0.02, 0.02]} />
            <meshStandardMaterial color={dark} roughness={1} />
          </mesh>
        </animated.group>
      </group>

      {/* Back flap — pivot at z=-1 top edge */}
      <group position={[0, 1.04, -1.04]}>
        <animated.group rotation-x={br}>
          <mesh position={[0, 0, 0.5]}>
            <boxGeometry args={[2.06, 0.07, 1.0]} />
            <meshStandardMaterial color={light} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.04, 0.98]}>
            <boxGeometry args={[2.06, 0.02, 0.02]} />
            <meshStandardMaterial color={dark} roughness={1} />
          </mesh>
        </animated.group>
      </group>

      {/* Left flap — pivot at x=-1 top edge */}
      <group position={[-1.04, 1.04, 0]}>
        <animated.group rotation-z={lr}>
          <mesh position={[0.5, 0, 0]}>
            <boxGeometry args={[1.0, 0.07, 2.06]} />
            <meshStandardMaterial color={dark} roughness={0.9} />
          </mesh>
        </animated.group>
      </group>

      {/* Right flap — pivot at x=+1 top edge */}
      <group position={[1.04, 1.04, 0]}>
        <animated.group rotation-z={rr}>
          <mesh position={[-0.5, 0, 0]}>
            <boxGeometry args={[1.0, 0.07, 2.06]} />
            <meshStandardMaterial color={dark} roughness={0.9} />
          </mesh>
        </animated.group>
      </group>
    </>
  )
}

function HouseIcon() {
  return (
    <group position={[0, 0.4, 0]} scale={0.45}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.4, 1.2, 1.4]} />
        <meshStandardMaterial color="#2D4A3E" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <coneGeometry args={[1.1, 1.0, 4]} />
        <meshStandardMaterial color="#D14D2B" roughness={0.7} />
      </mesh>
    </group>
  )
}

function ApartmentIcon() {
  return (
    <group position={[0, 0.3, 0]} scale={0.4}>
      {[-0.5, 0, 0.5].map((x, i) => (
        <mesh key={i} position={[x, i * 0.25, 0]}>
          <boxGeometry args={[0.35, 0.8 + i * 0.3, 0.35]} />
          <meshStandardMaterial color="#2D4A3E" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function OfficeIcon() {
  return (
    <group position={[0, 0.4, 0]} scale={0.42}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.0, 2.0, 1.0]} />
        <meshStandardMaterial color="#161614" roughness={0.6} />
      </mesh>
      {[-0.25, 0, 0.25].map((x, i) =>
        [-0.5, 0, 0.5].map((y, j) => (
          <mesh key={`${i}-${j}`} position={[x, y, 0.52]}>
            <boxGeometry args={[0.12, 0.2, 0.02]} />
            <meshStandardMaterial color="#90c0e0" emissive="#90c0e0" emissiveIntensity={0.3} />
          </mesh>
        ))
      )}
    </group>
  )
}

function StudentIcon() {
  return (
    <group position={[0, 0.3, 0]} scale={0.45}>
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[1.2, 0.9, 1.2]} />
        <meshStandardMaterial color="#D14D2B" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <coneGeometry args={[0.85, 0.7, 4]} />
        <meshStandardMaterial color="#161614" roughness={0.6} />
      </mesh>
    </group>
  )
}

function IconContent({ serviceType, isHovered }) {
  const { scale, posY } = useSpring({
    scale: isHovered ? 1 : 0,
    posY: isHovered ? 0 : -0.5,
    config: { tension: 200, friction: 18 }
  })

  const Icon = serviceType === 'house' ? HouseIcon
    : serviceType === 'office' ? OfficeIcon
    : serviceType === 'student' ? StudentIcon
    : ApartmentIcon

  return (
    <animated.group scale={scale} position-y={posY}>
      <Icon />
    </animated.group>
  )
}

function BoxMesh({ serviceType, isHovered }) {
  const meshRef = useRef()
  const time = useRef(0)
  const defaultRotations = { apartment: [0.2, 0.5, 0], house: [0.1, -0.4, 0.1], office: [0.15, 0.6, 0], student: [0.2, -0.3, 0.15] }
  const [rx, ry, rz] = defaultRotations[serviceType] || [0, 0, 0]

  useFrame((state, delta) => {
    time.current += delta
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(time.current * 0.8) * 0.15
    }
  })

  return (
    <group ref={meshRef} rotation={[rx, ry, rz]}>
      {/* Main box body */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#C8A06B" roughness={0.9} />
      </mesh>
      {/* Tape strip horizontal */}
      <mesh position={[0, 0, 1.02]}>
        <boxGeometry args={[2.02, 0.2, 0.02]} />
        <meshStandardMaterial color="#d4b882" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, -1.02]}>
        <boxGeometry args={[2.02, 0.2, 0.02]} />
        <meshStandardMaterial color="#d4b882" roughness={0.7} />
      </mesh>
      {/* Tape strip vertical */}
      <mesh position={[0, 0, 1.02]}>
        <boxGeometry args={[0.2, 2.02, 0.02]} />
        <meshStandardMaterial color="#d4b882" roughness={0.7} />
      </mesh>
      <BoxFlaps isHovered={isHovered} />
      <IconContent serviceType={serviceType} isHovered={isHovered} />
    </group>
  )
}

function SceneContent({ serviceType, isHovered }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 3]} intensity={1.2} />
      <pointLight position={[-3, 3, 3]} intensity={0.4} color="#F7F1E5" />
      <BoxMesh serviceType={serviceType} isHovered={isHovered} />
    </>
  )
}

export default function ServiceBox({ serviceType = 'apartment', isHovered = false }) {
  return (
    <Canvas3D
      dpr={[1, 1.5]}
      frameloop="always"
      camera={{ position: [0, 1, 5], fov: 45 }}
      style={{ width: '100%', height: '200px' }}
      fallback={<SceneFallback icon={FALLBACK_ICONS[serviceType]} />}
    >
      <Suspense fallback={null}>
        <SceneContent serviceType={serviceType} isHovered={isHovered} />
      </Suspense>
    </Canvas3D>
  )
}
