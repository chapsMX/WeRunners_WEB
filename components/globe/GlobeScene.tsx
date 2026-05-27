"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const CITIES = [
  { name: "CDMX",      lat:  19.4, lon:  -99.1 },
  { name: "Denver",    lat:  39.7, lon: -104.9  },
  { name: "London",    lat:  52.5, lon:   -1.5  },
  { name: "Lagos",     lat:   6.5, lon:    3.4  },
  { name: "Nairobi",   lat:  -1.3, lon:   37.0  },
  { name: "São Paulo", lat: -23.5, lon:  -47.5  },
  { name: "Osaka",     lat:  34.7, lon:  135.5  },
  { name: "Bangkok",   lat:  13.7, lon:  100.5  },
  { name: "Perth",     lat: -29.0, lon:  116.0  },
];

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  // +270 (not +180) because the GLB texture has lon=-180° (IDL/Pacific)
  // facing the camera — offset of +90° vs the standard formula
  const theta = (lon + 270) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function CityNode({ lat, lon }: { lat: number; lon: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const pos = latLonToVector3(lat, lon, 1.02);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.scale.setScalar(
        1 + 0.2 * Math.sin(clock.getElapsedTime() * 2 + lat)
      );
    }
  });

  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[0.025, 8, 8]} />
      <meshStandardMaterial
        color="#7AC142"
        emissive="#7AC142"
        emissiveIntensity={0.8}
      />
    </mesh>
  );
}

function Globe() {
  const groupRef = useRef<THREE.Group>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes, materials } = useGLTF("/models/globe.glb") as any;
  const geometry = (nodes.Sphere_0 as THREE.Mesh).geometry;
  const material = materials["Material.001"] as THREE.MeshStandardMaterial;

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} material={material} rotation={[-Math.PI / 2, 0, 0]} />
      {CITIES.map((city) => (
        <CityNode key={city.name} lat={city.lat} lon={city.lon} />
      ))}
    </group>
  );
}

useGLTF.preload("/models/globe.glb");

export default function GlobeScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 4, 4]} intensity={1.8} />
        <pointLight position={[-4, -4, -4]} intensity={0.4} color="#7AC142" />

        <Suspense fallback={null}>
          <Globe />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
      </Canvas>
    </div>
  );
}
