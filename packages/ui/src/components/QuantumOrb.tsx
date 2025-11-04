import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, OrbitControls, Environment } from '@react-three/drei';
import { Mesh } from 'three';

export interface QuantumOrbProps {
  isThinking?: boolean;
  hasResponse?: boolean;
  messageCount?: number;
  className?: string;
  height?: string;
}

interface OrbMeshProps {
  isThinking: boolean;
  hasResponse: boolean;
}

function OrbMesh({ isThinking, hasResponse }: OrbMeshProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Continuous rotation
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;

      // Pulse when thinking
      if (isThinking) {
        const pulseIntensity = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1;
        meshRef.current.scale.setScalar(pulseIntensity);
      } else {
        // Gradually return to normal size
        const targetScale = { x: 1, y: 1, z: 1 };
        meshRef.current.scale.lerp(targetScale as any, 0.05);
      }
    }
  });

  // Change color based on state
  const getColor = () => {
    if (isThinking) return '#3B82F6'; // Blue when thinking
    if (hasResponse) return '#10B981'; // Green when answered
    return '#8B5CF6'; // Default purple
  };

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <MeshDistortMaterial
        color={getColor()}
        attach="material"
        distort={0.3}
        speed={2}
        roughness={0.1}
        metalness={0.8}
        transparent
        opacity={0.9}
      />
    </Sphere>
  );
}

export function QuantumOrb({
  isThinking = false,
  hasResponse = false,
  messageCount = 0,
  className = '',
  height = 'h-96',
}: QuantumOrbProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`${className} ${height} bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Quantum Universe...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${className} ${height} bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden relative`}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3B82F6" />

        <OrbMesh isThinking={isThinking} hasResponse={hasResponse} />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          autoRotate={!isThinking}
          autoRotateSpeed={0.5}
        />

        <Environment preset="sunset" />
      </Canvas>

      {/* Status information */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isThinking
                  ? 'bg-blue-500 animate-pulse'
                  : hasResponse
                  ? 'bg-green-500'
                  : 'bg-purple-500'
              }`}
            ></div>
            <span className="text-gray-700">
              {isThinking ? 'Thinking...' : hasResponse ? 'Answered' : 'Waiting for query'}
            </span>
          </div>
          {messageCount > 0 && (
            <span className="text-gray-500">{messageCount} messages</span>
          )}
        </div>
      </div>
    </div>
  );
}
