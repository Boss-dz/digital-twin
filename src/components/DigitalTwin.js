"use client";
import React, { useEffect, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

function DebugInfo({ scene }) {
  const { camera } = useThree();
  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      console.log("--- 3D DEBUG LOG ---");
      console.log("Model Size:", size);
      console.log("Camera Position:", camera.position);
      if (size.x < 0.1) console.warn("WARNING: Model is TINY.");
      if (size.x > 1000) console.warn("WARNING: Model is HUGE.");
    }
  }, [scene, camera]);
  return null;
}

function Model({ onPlantClick }) {
  const { scene } = useGLTF("/models/test/model.glb");

  const scaledScene = React.useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    scene.position.x -= center.x;
    scene.position.z -= center.z;
    scene.position.y -= box.min.y;

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const scaleFactor = 10 / maxDim;
      scene.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.name.includes("Plant") && !window.foundSick) {
          child.material = child.material.clone();
          child.material.color = new THREE.Color("#ef4444");
          child.userData = { isSick: true, id: child.name };
          window.foundSick = true;
        }
      }
    });

    return scene;
  }, [scene]);

  return (
    <>
      <DebugInfo scene={scaledScene} />
      <primitive
        object={scaledScene}
        onClick={(e) => {
          e.stopPropagation();
          if (e.object.userData.isSick) onPlantClick(e.object.userData.id);
        }}
      />
    </>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="text-white">Loading...</div>
    </Html>
  );
}

export default function DigitalTwin({ onPlantClick }) {
  return (
    // KEY FIX: was "-z-10" — canvas was behind all overlays and couldn't receive pointer events
    <div className="w-full h-full">
      <Canvas
        shadows
        legacy={true}
        frameloop="always"
        gl={{ antialias: true }}
        camera={{ position: [5, 5, 5], fov: 50 }}
      >
        <ambientLight intensity={2} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <gridHelper args={[20, 20]} />
        <axesHelper args={[5]} />

        <Suspense fallback={<Loader />}>
          <Model onPlantClick={onPlantClick} />
        </Suspense>

        <OrbitControls makeDefault />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
