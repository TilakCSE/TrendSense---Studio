"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Environment, Float, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

function CubeModel() {
  const cubeRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x += delta * 0.15;
      cubeRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group>
      {/* 3D Text updated to Burgundy */}
      <Text 
        position={[0, 0, -2]} 
        fontSize={2.5} 
        color="#630019" 
        letterSpacing={-0.05}
        fontWeight="bold"
      >
        TrendSense.
      </Text>

      {/* Sized down, perfectly clear glass */}
      <RoundedBox ref={cubeRef} args={[1.8, 1.8, 1.8]} radius={0.1} smoothness={4}>
        <MeshTransmissionMaterial
          backside={true}
          samples={16}
          resolution={1024}
          transmission={1.0}       
          roughness={0.05}         
          thickness={1.5}  
          ior={1.2}        
          chromaticAberration={0.04} 
          color="#ffffff"          
        />
      </RoundedBox>
    </group>
  );
}

export default function GlassCube() {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ antialias: true }}>
        <color attach="background" args={['#F0E7C2']} />
        <ambientLight intensity={2} />
        <Environment preset="studio" />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <CubeModel />
        </Float>
      </Canvas>
    </div>
  );
}