import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { scene3DConfig } from '@/config';

// =============================================================================
// Glowing Sphere Component (Trend Node)
// =============================================================================
interface GlowingSphereProps {
  position?: [number, number, number];
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
}

function GlowingSphere({
  position = [0, 5, 0],
  color = scene3DConfig.sphereColor,
  emissive = scene3DConfig.sphereEmissive,
  emissiveIntensity = 0.5,
}: GlowingSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const rigidBodyRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  // Subtle floating animation when not falling
  useFrame((state) => {
    if (meshRef.current && rigidBodyRef.current) {
      const velocity = rigidBodyRef.current.linvel();
      // Only apply subtle rotation when nearly stationary
      if (velocity.y < 0.1 && velocity.y > -0.1) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      }
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      colliders="ball"
      restitution={0.7}
      friction={0.2}
      linearDamping={0.1}
      angularDamping={0.1}
      mass={1}
    >
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <sphereGeometry args={[0.8, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={hovered ? emissiveIntensity * 1.5 : emissiveIntensity}
          metalness={0.3}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>
      {/* Inner glow core */}
      <mesh scale={0.6}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial
          color={emissive}
          transparent
          opacity={0.3}
        />
      </mesh>
    </RigidBody>
  );
}

// =============================================================================
// Reflective Floor Component
// =============================================================================
interface ReflectiveFloorProps {
  color?: string;
}

function ReflectiveFloor({ color = scene3DConfig.floorColor }: ReflectiveFloorProps) {
  return (
    <group>
      {/* Physical floor collider */}
      <CuboidCollider
        position={[0, -2, 0]}
        args={[20, 0.5, 20]}
        friction={0.5}
        restitution={0.3}
      />
      {/* Visual floor */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={0.5}
        />
      </mesh>
      {/* Grid pattern on floor */}
      <mesh position={[0, -1.99, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial
          color={scene3DConfig.sphereColor}
          transparent
          opacity={0.05}
          wireframe
        />
      </mesh>
    </group>
  );
}

// =============================================================================
// Lighting Setup
// =============================================================================
function SceneLighting() {
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={scene3DConfig.ambientLightIntensity} />
      
      {/* Main directional light (moon-like) */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Neon rim light */}
      <pointLight
        position={[-5, 2, -5]}
        color={scene3DConfig.sphereColor}
        intensity={scene3DConfig.rimLightIntensity}
        distance={20}
        decay={2}
      />
      
      {/* Fill light from opposite side */}
      <pointLight
        position={[5, 3, 5]}
        color="#4D9FFF"
        intensity={0.5}
        distance={15}
        decay={2}
      />
      
      {/* Bottom glow */}
      <pointLight
        position={[0, -1, 0]}
        color={scene3DConfig.sphereColor}
        intensity={0.3}
        distance={10}
        decay={2}
      />
    </>
  );
}

// =============================================================================
// Camera Controller with subtle movement
// =============================================================================
function CameraController() {
  const { camera } = useThree();
  const initialPosition = useRef(camera.position.clone());

  useFrame((state) => {
    // Subtle camera sway
    const time = state.clock.elapsedTime;
    camera.position.x = initialPosition.current.x + Math.sin(time * 0.2) * 0.3;
    camera.position.y = initialPosition.current.y + Math.cos(time * 0.15) * 0.2;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// =============================================================================
// Particle Field for atmosphere
// =============================================================================
function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 50;

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10 + 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      vel.push(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      );
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += velocities[i * 3];
        posArray[i * 3 + 1] += velocities[i * 3 + 1];
        posArray[i * 3 + 2] += velocities[i * 3 + 2];

        // Wrap around
        if (posArray[i * 3] > 10) posArray[i * 3] = -10;
        if (posArray[i * 3] < -10) posArray[i * 3] = 10;
        if (posArray[i * 3 + 1] > 7) posArray[i * 3 + 1] = -3;
        if (posArray[i * 3 + 1] < -3) posArray[i * 3 + 1] = 7;
        if (posArray[i * 3 + 2] > 10) posArray[i * 3 + 2] = -10;
        if (posArray[i * 3 + 2] < -10) posArray[i * 3 + 2] = 10;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        color={scene3DConfig.sphereColor}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// =============================================================================
// Main Scene Content
// =============================================================================
interface SceneContentProps {
  spherePosition?: [number, number, number];
}

function SceneContent({ spherePosition = [0, 5, 0] }: SceneContentProps) {
  return (
    <>
      <SceneLighting />
      <CameraController />
      
      <Physics gravity={[0, -9.81, 0]}>
        <GlowingSphere position={spherePosition} />
        <ReflectiveFloor />
      </Physics>
      
      <ParticleField />
      
      <ContactShadows
        position={[0, -1.99, 0]}
        opacity={0.4}
        scale={20}
        blur={2}
        far={4}
      />
      
      <Environment preset="night" />
    </>
  );
}

// =============================================================================
// Main Physics Scene Component (Export this)
// =============================================================================
interface PhysicsSceneProps {
  className?: string;
  spherePosition?: [number, number, number];
  onSphereClick?: () => void;
}

export function PhysicsScene({ 
  className = '', 
  spherePosition,
}: PhysicsSceneProps) {
  return (
    <div className={`canvas-container ${className}`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        className="r3f-canvas"
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 2, 8]}
          fov={50}
          near={0.1}
          far={100}
        />
        <SceneContent spherePosition={spherePosition} />
      </Canvas>
    </div>
  );
}

// =============================================================================
// Modular Export for Future GLB Model Integration
// =============================================================================

/**
 * Instructions for replacing the sphere with a GLB model:
 * 
 * 1. Install the GLB loader:
 *    npm install three @types/three
 * 
 * 2. Import the GLTF loader:
 *    import { useGLTF } from '@react-three/drei'
 * 
 * 3. Create a new Model component:
 *    
 *    interface ModelProps {
 *      path: string;
 *      position?: [number, number, number];
 *      scale?: number;
 *    }
 *    
 *    function Model({ path, position = [0, 5, 0], scale = 1 }: ModelProps) {
 *      const { scene } = useGLTF(path);
 *      const modelRef = useRef<THREE.Group>(null);
 *      
 *      // Clone the scene to avoid sharing materials
 *      const clonedScene = useMemo(() => scene.clone(), [scene]);
 *      
 *      return (
 *        <RigidBody position={position} colliders="trimesh">
 *          <primitive 
 *            ref={modelRef}
 *            object={clonedScene} 
 *            scale={scale}
 *          />
 *        </RigidBody>
 *      );
 *    }
 * 
 * 4. Replace <GlowingSphere /> with <Model path="/your-model.glb" />
 * 
 * 5. Preload the model:
 *    useGLTF.preload('/your-model.glb')
 */

export default PhysicsScene;
