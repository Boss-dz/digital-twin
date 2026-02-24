"use client";
import React, { useEffect, useState, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { AlertTriangle } from "lucide-react";

// NEW: This component mathematically animates the camera without external libraries
function CameraRig({ focusPos }) {
  const { camera } = useThree();
  const controls = useThree((state) => state.controls);
  const [target, setTarget] = useState(null);

  useEffect(() => {
    if (focusPos) {
      // When a new focus command comes in, set the target
      setTarget(new THREE.Vector3(focusPos.x, focusPos.y, focusPos.z));
    }
  }, [focusPos]);

  useFrame((state, delta) => {
    // If we have an active target, smoothly fly the camera to it
    if (target && controls) {
      // Position the camera slightly above and to the right of the target plant
      const camTarget = new THREE.Vector3(
        target.x + 1.5,
        target.y + 1.5,
        target.z + 2,
      );

      // Interpolate (smoothly move) position and look-at angle
      camera.position.lerp(camTarget, delta * 4);
      controls.target.lerp(target, delta * 4);
      controls.update();

      // Once the camera arrives at the plant, turn off the animation
      // so the admin regains manual control of the mouse
      if (camera.position.distanceTo(camTarget) < 0.1) {
        setTarget(null);
      }
    }
  });

  return null;
}

function Model({ onPlantClick, sickPlants, focusPlant }) {
  const { scene } = useGLTF("/models/test/model.glb");
  const [markers, setMarkers] = useState([]);
  const [cameraFocusTarget, setCameraFocusTarget] = useState(null);

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
    return scene;
  }, [scene]);

  useEffect(() => {
    let currentPlantCounter = 0;
    let newMarkers = [];
    let foundFocusPos = null;

    // We must update world matrices to get accurate XYZ coordinates for the markers
    scaledScene.updateMatrixWorld(true);

    scaledScene.traverse((child) => {
      if (child.isMesh && child.name.includes("Plant")) {
        if (!child.userData.originalColor) {
          child.userData.originalColor = child.material.color.clone();
          child.userData.plantId = currentPlantCounter;
        }

        // Check if this plant is sick
        if (
          sickPlants.some((sick) => sick.plantIndex === child.userData.plantId)
        ) {
          child.material = child.material.clone();
          child.material.color = new THREE.Color("#ef4444");
          child.userData.isSick = true;

          // NEW: Calculate real-world coordinates for the floating HTML marker
          const worldPos = new THREE.Vector3();
          child.getWorldPosition(worldPos);

          // Add marker slightly above the plant (y + 0.8)
          newMarkers.push({
            id: child.userData.plantId,
            position: [worldPos.x, worldPos.y + 0.8, worldPos.z],
          });

          // Check if this is the plant the user clicked from the Alert sidebar
          if (focusPlant === child.userData.plantId) {
            foundFocusPos = worldPos;
          }
        } else {
          child.material.color = child.userData.originalColor;
          child.userData.isSick = false;
        }

        currentPlantCounter++;
      }
    });

    setMarkers(newMarkers);
    if (foundFocusPos) {
      setCameraFocusTarget(foundFocusPos);
    }
  }, [scaledScene, sickPlants, focusPlant]);

  return (
    <>
      <CameraRig focusPos={cameraFocusTarget} />
      <primitive
        object={scaledScene}
        onClick={(e) => {
          e.stopPropagation();
          if (e.object.userData.plantId !== undefined) {
            onPlantClick(e.object.userData.plantId);
          }
        }}
      />

      {/* NEW: Render floating 3D HTML markers over infected plants */}
      {markers.map((marker) => (
        <Html key={marker.id} position={marker.position} center>
          <div
            onClick={(e) => {
              // Make the marker clickable too!
              e.stopPropagation();
              onPlantClick(marker.id);
            }}
            className="animate-bounce bg-red-600/90 backdrop-blur-sm text-white p-2 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.7)] cursor-pointer hover:bg-red-500 transition-colors border border-red-400"
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Html>
      ))}
    </>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="text-white font-bold animate-pulse">
        Loading Digital Twin...
      </div>
    </Html>
  );
}

export default function DigitalTwin({
  onPlantClick,
  sickPlants = [],
  focusPlant = null,
}) {
  return (
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
          <Model
            onPlantClick={onPlantClick}
            sickPlants={sickPlants}
            focusPlant={focusPlant}
          />
        </Suspense>
        <OrbitControls makeDefault />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}