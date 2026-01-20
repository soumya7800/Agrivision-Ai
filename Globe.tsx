import React, { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Sphere, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface GlobeProps {
  targetLat?: number;
  targetLng?: number;
  isRotating?: boolean;
  className?: string;
  height?: number;
  width?: number;
  weather?: any;
}

// 1. Photorealistic Atmosphere Shader
// Uses a refined Fresnel calculation for a soft, realistic "thin blue line"
const AtmosphereShader = {
  uniforms: {
    c: { value: 0.65 },
    p: { value: 4.5 },
    glowColor: { value: new THREE.Color(0x4ca6ff) }, // True Atmospheric Blue
    viewVector: { value: new THREE.Vector3(0, 0, 5) }
  },
  vertexShader: `
    uniform vec3 viewVector;
    uniform float c;
    uniform float p;
    varying float intensity;
    void main() {
      vec3 vNormal = normalize(normalMatrix * normal);
      vec3 vView = normalize(normalMatrix * viewVector);
      intensity = pow(c - dot(vNormal, vView), p);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 glowColor;
    varying float intensity;
    void main() {
      vec3 glow = glowColor * intensity;
      // Soft fade out
      gl_FragColor = vec4(glow, clamp(intensity, 0.0, 1.0)); 
    }
  `
};

// 2. Precision Marker (Pro-Level)
const TargetBeacon = ({ lat, lng }: { lat: number, lng: number }) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const r = 2.005; // Tight fit

  const x = -(r * Math.sin(phi) * Math.cos(theta));
  const z = (r * Math.sin(phi) * Math.sin(theta));
  const y = (r * Math.cos(phi));

  const position = new THREE.Vector3(x, y, z);
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), position.clone().normalize());

  return (
    <group position={position} quaternion={quaternion}>
      {/* Laser Beam (Thin, bright) */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 1.2, 8]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.8} />
      </mesh>

      {/* Surface Contact Point */}
      <mesh position={[0, 0, 0]}>
        <circleGeometry args={[0.015, 32]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>

      {/* Radar Ping Effect */}
      <PulseRing />
    </group>
  );
}

const PulseRing = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime() * 1.5;
      const scale = 1 + (t % 1) * 3;
      ref.current.scale.set(scale, 1, scale);
      const opacity = 1 - (t % 1);
      if (Array.isArray(ref.current.material)) return;
      (ref.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.5;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
      <ringGeometry args={[0.02, 0.025, 32]} />
      <meshBasicMaterial color="#10b981" transparent side={THREE.DoubleSide} />
    </mesh>
  )
}


const EarthScene = ({ targetLat, targetLng, isRotating }: GlobeProps) => {
  const earthRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const frameCount = useRef(0);

  // Load Textures
  const [colorMap, specularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  ]);

  useFrame((state, delta) => {
    // 1. Independent Cloud Rotation (Realistic wind)
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.008;
    }

    // 2. Earth Rotation Physics
    if (earthRef.current) {
      if (isRotating) {
        // Idle Rotation
        earthRef.current.rotation.y += delta * 0.05;
      } else {
        // Target Locking
        const latRad = targetLat! * (Math.PI / 180);
        const lngRad = targetLng! * (Math.PI / 180);

        const targetY = -lngRad - Math.PI / 2;
        const targetX = latRad;

        // Critical Damping
        const step = 3.0 * delta;

        let currentY = earthRef.current.rotation.y;
        while (currentY - targetY > Math.PI) currentY -= Math.PI * 2;
        while (currentY - targetY < -Math.PI) currentY += Math.PI * 2;

        earthRef.current.rotation.y = THREE.MathUtils.lerp(currentY, targetY, step);
        earthRef.current.rotation.x = THREE.MathUtils.lerp(earthRef.current.rotation.x, targetX, step);
        earthRef.current.rotation.z = THREE.MathUtils.lerp(earthRef.current.rotation.z, 0, step);
      }
    }
  });

  return (
    <group ref={earthRef}>
      {/* 1. Earth Surface */}
      <Sphere args={[2, 64, 64]}>
        <meshPhongMaterial
          map={colorMap}
          specularMap={specularMap}
          specular={new THREE.Color(0x555555)} // Reduced specular intensity for realism
          shininess={12}

          // Natural Color (No tints)
          color="#ffffff"
          // Slightly dims the texture to prevent blown-out whites
          emissive={new THREE.Color("#000000")}
        />
      </Sphere>

      {/* 2. Cloud Layer */}
      <Sphere args={[2.02, 64, 64]} ref={cloudsRef}>
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </Sphere>

      {/* 3. Atmosphere Halo */}
      <Sphere args={[2.2, 64, 64]}>
        <shaderMaterial
          args={[AtmosphereShader]}
          side={THREE.BackSide} // Only render backface for 'halo' effect
          blending={THREE.AdditiveBlending}
          transparent={true}
          depthWrite={false}
        />
      </Sphere>

      {/* 4. Target Beacon */}
      {!isRotating && targetLat !== undefined && (
        <TargetBeacon lat={targetLat} lng={targetLng || 0} />
      )}
    </group>
  );
};

export const Globe: React.FC<GlobeProps> = (props) => {
  return (
    <div className={`w-full h-full flex items-center justify-center ${props.className || ''}`}>
      <Canvas camera={{ position: [0, 0, 8.5], fov: 35 }} gl={{ antialias: true, alpha: true }}>

        {/* Lighting for Realism */}

        {/* Ambient: Dark Space */}
        <ambientLight intensity={0.05} />

        {/* Sun: Bright, slightly warm */}
        <directionalLight position={[5, 3, 5]} intensity={2.0} color="#fffaed" />

        {/* Rim/Fill: Cool Blue from atmosphere scattering */}
        <spotLight position={[-10, 0, 5]} intensity={1.5} color="#2563eb" angle={0.5} />

        {/* Realistic Starfield */}
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />

        <Suspense fallback={null}>
          <EarthScene {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
};
