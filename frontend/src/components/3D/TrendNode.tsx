import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

interface TrendNodeProps {
    isPredicting?: boolean
    props?: any
}

export function TrendNode({ isPredicting, ...props }: TrendNodeProps) {
    const { nodes, materials } = useGLTF('/TrendSenseNeonCore.glb') as any
    const rigidBodyRef = useRef<RapierRigidBody>(null)
    const ringsRef = useRef<THREE.Mesh>(null)
    const groupRef = useRef<THREE.Group>(null)

    // Floating motion factor
    useFrame((state) => {
        const time = state.clock.getElapsedTime()

        // 1. DataRings rotation
        if (ringsRef.current) {
            // Rotate faster when predicting
            const rotationSpeed = isPredicting ? 4.0 : 0.8
            ringsRef.current.rotation.y += 0.01 * rotationSpeed
            ringsRef.current.rotation.z += 0.005 * rotationSpeed
        }

        // 2. Subtle up-and-down floating motion
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(time * 0.5) * 0.15
        }

        // 3. Make the whole model spin faster when predicting
        if (rigidBodyRef.current) {
            if (isPredicting) {
                rigidBodyRef.current.applyTorqueImpulse({ x: 0, y: 0.02, z: 0 }, true)
            }
        }
    })

    // Safety check: Ensure all required nodes and materials exist
    if (!nodes?.NeonCore || !nodes?.GlassShell || !nodes?.DataRings) {
        console.warn('TrendNode: Missing geometry nodes in GLTF model')
        return null
    }

    return (
        <group ref={groupRef} {...props} dispose={null}>
            <RigidBody
                ref={rigidBodyRef}
                gravityScale={0}
                colliders="hull"
                enabledRotations={[false, true, false]}
            >
                {/* Neon Core */}
                <mesh
                    geometry={nodes.NeonCore.geometry}
                    material={materials.Mat_NeonCore}
                >
                    <meshStandardMaterial
                        {...materials.Mat_NeonCore}
                        emissive="#00FF88"
                        emissiveIntensity={Math.max(isPredicting ? 5 : 1.5, 0.0001)}
                    />
                </mesh>

                {/* Glass Shell */}
                <mesh
                    geometry={nodes.GlassShell.geometry}
                    material={materials.Mat_GlassShell}
                >
                    <meshPhysicalMaterial
                        roughness={0}
                        transmission={1}
                        thickness={Math.max(0.5, 0.0001)}
                        envMapIntensity={Math.max(1, 0.0001)}
                        transparent
                        opacity={0.3}
                    />
                </mesh>

                {/* Data Rings */}
                <mesh
                    ref={ringsRef}
                    geometry={nodes.DataRings.geometry}
                    material={materials.Mat_DataRings}
                    rotation={[Math.PI / 4, 0, 0]}
                >
                    <meshStandardMaterial
                        {...materials.Mat_DataRings}
                        emissive="#00FF88"
                        emissiveIntensity={Math.max(isPredicting ? 8 : 2, 0.0001)}
                    />
                </mesh>
            </RigidBody>
        </group>
    )
}

useGLTF.preload('/TrendSenseNeonCore.glb')
