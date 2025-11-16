'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Sphere, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/lib/use-reduced-motion';

extend({ OrbitControls });

interface ParticleFieldProps {
  count: number;
}

function ParticleField({ count }: ParticleFieldProps) {
  const points = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 3 + Math.random() * 2;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, [count]);
  
  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });
  
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#14F195"
        sizeAttenuation
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface AIAgentProps {
  mouseX: number;
  mouseY: number;
  reducedMotion: boolean;
}

function AIAgent({ mouseX, mouseY, reducedMotion }: AIAgentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const icosahedronRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (reducedMotion) return;
    
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
      
      groupRef.current.position.x += (mouseX * 0.5 - groupRef.current.position.x) * 0.05;
      groupRef.current.position.y += (-mouseY * 0.5 - groupRef.current.position.y) * 0.05;
    }
    
    if (icosahedronRef.current) {
      icosahedronRef.current.rotation.x = state.clock.getElapsedTime() * 0.4;
      icosahedronRef.current.rotation.z = state.clock.getElapsedTime() * 0.2;
    }
    
    if (sphereRef.current) {
      sphereRef.current.rotation.y = -state.clock.getElapsedTime() * 0.3;
    }
  });
  
  return (
    <group ref={groupRef}>
      <Icosahedron ref={icosahedronRef} args={[1, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#9945FF"
          emissive="#9945FF"
          emissiveIntensity={0.5}
          wireframe
          transparent
          opacity={0.8}
        />
      </Icosahedron>
      
      <Sphere ref={sphereRef} args={[0.7, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#14F195"
          emissive="#14F195"
          emissiveIntensity={0.6}
          transparent
          opacity={0.3}
          wireframe={false}
        />
      </Sphere>
      
      <Sphere args={[1.2, 16, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#9945FF"
          emissive="#9945FF"
          emissiveIntensity={0.3}
          transparent
          opacity={0.2}
          wireframe
        />
      </Sphere>
      
      <pointLight position={[0, 0, 0]} color="#14F195" intensity={2} distance={5} />
      <pointLight position={[2, 2, 2]} color="#9945FF" intensity={1} distance={5} />
    </group>
  );
}

interface SceneProps {
  mouseX: number;
  mouseY: number;
  isMobile: boolean;
  isVisible: boolean;
  reducedMotion: boolean;
}

function Scene({ mouseX, mouseY, isMobile, isVisible, reducedMotion }: SceneProps) {
  useFrame(() => {
    if (!isVisible) return;
  });
  
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <AIAgent mouseX={mouseX} mouseY={mouseY} reducedMotion={reducedMotion} />
      <ParticleField count={isMobile || reducedMotion ? 300 : 1000} />
    </>
  );
}

interface Hero3DProps {
  className?: string;
}

export default function Hero3D({ className = '' }: Hero3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const [isVisible, setIsVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(containerRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (containerRef.current && !reducedMotion) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.current = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY.current = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    }
  };
  
  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      onPointerMove={handlePointerMove}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        frameloop={isVisible && !reducedMotion ? 'always' : 'demand'}
      >
        <Scene
          mouseX={mouseX.current}
          mouseY={mouseY.current}
          isMobile={isMobile}
          isVisible={isVisible}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
}
