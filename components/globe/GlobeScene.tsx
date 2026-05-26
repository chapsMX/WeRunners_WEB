"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// DEBUG: each city has a unique color for visual identification
const CITIES = [
  { name: "CDMX",      lat:  19.4, lon:  -99.1, color: "#ff0000" }, // 1 — ROJO
  { name: "Denver",    lat:  39.7, lon: -104.9,  color: "#ff8800" }, // 2 — NARANJA
  { name: "London",    lat:  52.5, lon:   -1.5,  color: "#ffff00" }, // 3 — AMARILLO
  { name: "Lagos",     lat:   6.5, lon:    3.4,  color: "#00ff00" }, // 4 — VERDE
  { name: "Nairobi",   lat:  -1.3, lon:   37.0,  color: "#00ffff" }, // 5 — CYAN
  { name: "São Paulo", lat: -23.5, lon:  -47.5,  color: "#0088ff" }, // 6 — AZUL
  { name: "Osaka",     lat:  34.7, lon:  135.5,  color: "#ff00ff" }, // 7 — MAGENTA
  { name: "Bangkok",   lat:  13.7, lon:  100.5,  color: "#ff69b4" }, // 8 — ROSA
  { name: "Perth",     lat: -29.0, lon:  116.0,  color: "#ffffff" }, // 9 — BLANCO
];

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function CityNode({ lat, lon, color }: { lat: number; lon: number; color: string }) {
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
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.2}
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
        <CityNode key={city.name} lat={city.lat} lon={city.lon} color={city.color} />
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
        <pointLight position={[-4, -4, -4]} intensity={0.4} color="#ffffff" />

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
