"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  MeshTransmissionMaterial,
  Environment,
  Float,
  RoundedBox,
  Text,
} from "@react-three/drei";
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
      {/* TEXT MATCHING PRICING BACKGROUND (#00291C - Charleston Green) */}
      <Text
        position={[0, 0, -2]}
        fontSize={2.5}
        color="#00291C"
        letterSpacing={-0.05}
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        TrendSense.
      </Text>

      {/* GLASS CUBE */}
      <RoundedBox
        ref={cubeRef}
        args={[1.8, 1.8, 1.8]}
        radius={0.12}
        smoothness={4}
      >
        <MeshTransmissionMaterial
          backside={true}
          // 🔥 OPTIMIZED FOR 60FPS (No Lag)
          samples={16} 
          resolution={512}
          
          transmission={1}
          roughness={0.05}
          
          thickness={2.5}     // Deep refraction
          ior={1.4}           // Glass bending
          
          chromaticAberration={0.08} // 🌈 Rainbow edges preserved
          anisotropy={0.2}
          
          distortion={0.2}           // Wavy glass effect preserved
          distortionScale={0.4}
          temporalDistortion={0.1}
          
          clearcoat={1}
          clearcoatRoughness={0}
          color="#ffffff"
        />
      </RoundedBox>
    </group>
  );
}

export default function GlassCube() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      {/* Removed alpha: true, added explicit Starlight background to prevent Black Glass */}
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: true }}
      >
        {/* 🔥 CRITICAL: This paints the 3D void Starlight so the glass isn't black! */}
        <color attach="background" args={['#F0E7C2']} />

        {/* LIGHTING */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />

        {/* STUDIO preset reflects clean white light instead of dark city buildings */}
        <Environment preset="studio" />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <CubeModel />
        </Float>
      </Canvas>
    </div>
  );
}