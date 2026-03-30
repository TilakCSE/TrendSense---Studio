"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Environment, useGLTF, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// =============================================================================
// Frosted Glass Core — R3F 3D Component
// Features: Inner core, counter-rotating data rings, and a refractive glass shell.
// =============================================================================

interface CoreGeometryProps {
  viralityIndex: number;
}

function CoreModel({ viralityIndex }: CoreGeometryProps) {
  // Load the GLB and bypass strict typing for the nodes to avoid TS errors
  const { nodes } = useGLTF('/TrendSenseNeonCore.glb') as any;
  
  const groupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Mesh>(null);

  // Map virality (0-100) to rotation speed and glass distortion
  const baseRotation = 0.002 + (viralityIndex / 100) * 0.008;
  const distortionIntensity = (viralityIndex / 100) * 0.2; 

  useFrame((state) => {
    if (groupRef.current) {
      // Rotate the entire assembly
      groupRef.current.rotation.y += baseRotation;
      groupRef.current.rotation.x += baseRotation * 0.5;
      
      // Subtle "breathing" scale effect
      const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
      groupRef.current.scale.setScalar(breathingScale);
    }

    if (ringsRef.current) {
      // Counter-rotate the data rings for a complex mechanical feel
      ringsRef.current.rotation.z -= baseRotation * 2;
      ringsRef.current.rotation.x += baseRotation;
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      
      {/* 1. The Inner Core (Solid Cyan Glow) */}
      <mesh geometry={nodes.NeonCore.geometry}>
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      {/* 2. The Data Rings (Subtle Wireframe or Metallic) */}
      <mesh ref={ringsRef} geometry={nodes.DataRings.geometry}>
        <meshStandardMaterial 
          color="#00D4FF" 
          emissive="#00D4FF" 
          emissiveIntensity={0.5} 
          wireframe={true} 
          transparent 
          opacity={0.3} 
        />
      </mesh>

      {/* 3. The Frosted Glass Shell (Refraction Magic) */}
      <mesh geometry={nodes.GlassShell.geometry}>
        <MeshTransmissionMaterial
          backside={true}
          samples={16}
          resolution={512}
          transmission={1.0}
          roughness={0.2}
          thickness={3.0}
          chromaticAberration={0.08}
          anisotropy={0.3}

          // Reactivity wired to FastAPI
          distortion={distortionIntensity}
          distortionScale={0.5}
          temporalDistortion={0.1}

          // Linear Aesthetic Colors
          color="#ffffff"
          attenuationColor="#06b6d4"
          attenuationDistance={2}
          ior={1.5}
        />
      </mesh>

    </group>
  );
}

// Preload the model so it caches instantly on page load
useGLTF.preload('/TrendSenseNeonCore.glb');

// =============================================================================
// Public Component
// =============================================================================

export interface FrostedCoreProps {
  viralityIndex?: number;
  className?: string;
}

export function FrostedCore({ viralityIndex = 0, className = "w-full h-[280px]" }: FrostedCoreProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]} 
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        
        {/* The Environment is required for the glass shell to reflect light */}
        <Environment preset="city" />

        <CoreModel viralityIndex={viralityIndex} />
        
        {/* Soft, premium shadow beneath the floating core */}
        <ContactShadows position={[0, -1.2, 0]} opacity={0.5} scale={5} blur={2.5} far={2} color="#000000" />
      </Canvas>
    </div>
  );
}