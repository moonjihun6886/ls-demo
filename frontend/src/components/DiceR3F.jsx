import React, { Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Html } from "@react-three/drei";
import * as THREE from "three";

function DiceMaterial() {
  // Red translucent plastic with strong specular
  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xff1b1b),
      roughness: 0.2,
      transmission: 0.7,
      thickness: 1.4,
      ior: 1.4,
      metalness: 0.1,
      clearcoat: 0.75,
      clearcoatRoughness: 0.2,
      transparent: true,
    });
    return mat;
  }, []);
  return <primitive object={material} attach="material" />;
}

function Pips({ size = 1 }) {
  // Create white pips on each face to match reference photo
  const pipGeom = useMemo(() => new THREE.SphereGeometry(0.08 * size, 24, 24), [size]);
  const pipMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x111111 }), []);

  const offsets = 0.28 * size;
  const mid = 0;
  const far = 0.5 * size + 0.01;
  const pips = [];

  // Helper to add a pip
  const add = (x, y, z) => pips.push(<mesh key={`${x}-${y}-${z}`} position={[x, y, z]} geometry={pipGeom} material={pipMat} />);

  // Face +Z: 1 (center)
  add(0, 0, far);
  // Face -Z: 6 (three left, three right)
  [-offsets, mid, offsets].forEach((y) => {
    add(-offsets, y, -far);
  });
  [-offsets, mid, offsets].forEach((y) => {
    add(offsets, y, -far);
  });
  // Face +X: 3 (tl, center, br)
  add(far, offsets, offsets);
  add(far, 0, 0);
  add(far, -offsets, -offsets);
  // Face -X: 4 (tl, tr, bl, br)
  add(-far, offsets, offsets);
  add(-far, offsets, -offsets);
  add(-far, -offsets, offsets);
  add(-far, -offsets, -offsets);
  // Face +Y: 5 (four corners + center)
  add(-offsets, far, offsets);
  add(offsets, far, offsets);
  add(0, far, 0);
  add(-offsets, far, -offsets);
  add(offsets, far, -offsets);
  // Face -Y: 2 (tl, br)
  add(-offsets, -far, offsets);
  add(offsets, -far, -offsets);

  return <group>{pips}</group>;
}

function DiceMesh({ size = 1 }) {
  const ref = React.useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = t * 0.35;
      ref.current.rotation.y = t * 0.25 + Math.sin(t * 0.2) * 0.3;
    }
  });

  return (
    <group ref={ref}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <DiceMaterial />
      </mesh>
      <Pips size={size} />
    </group>
  );
}

export default function DiceR3F({ viewport = 700, cube = 2.4 }) {
  return (
    <div className="hidden md:block" style={{ width: viewport, height: viewport }}>
      <Canvas shadows camera={{ position: [3, 2, 5], fov: 40 }} dpr={[1, 2]} gl={{ alpha: true }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.4} castShadow />
        <Float floatIntensity={1.2} rotationIntensity={0.2} speed={1.5}>
          <DiceMesh size={cube} />
        </Float>
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}