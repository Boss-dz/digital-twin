"use client";
import React, { useEffect, useState, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
// NEW: Imported the 'Focus' icon for the center view
import {
  AlertTriangle,
  Home,
  Box,
  Grid,
  ZoomIn,
  ZoomOut,
  Focus,
} from "lucide-react";

// CameraRig handles both alert focus and manual UI controls
function CameraRig({ focusPos, customView, onClearView }) {
  const { camera } = useThree();
  const controls = useThree((state) => state.controls);
  const [target, setTarget] = useState(null);
  const [targetPos, setTargetPos] = useState(null);

  useEffect(() => {
    if (focusPos) {
      setTarget(new THREE.Vector3(focusPos.x, focusPos.y, focusPos.z));
      setTargetPos(
        new THREE.Vector3(focusPos.x + 1.5, focusPos.y + 1.5, focusPos.z + 2),
      );
    }
  }, [focusPos]);

  useEffect(() => {
    if (customView && controls) {
      if (customView.action === "zoomIn" || customView.action === "zoomOut") {
        const dir = camera.position.clone().sub(controls.target).normalize();
        const dist = camera.position.distanceTo(controls.target);
        const modifier = customView.action === "zoomIn" ? -2 : 2;
        const newDist = Math.max(1, dist + modifier);

        setTargetPos(controls.target.clone().add(dir.multiplyScalar(newDist)));
        setTarget(controls.target.clone());
      } else {
        setTargetPos(new THREE.Vector3(...customView.pos));
        setTarget(new THREE.Vector3(...customView.target));
      }
    }
  }, [customView, camera, controls]);

  useFrame((state, delta) => {
    if (target && targetPos && controls) {
      camera.position.lerp(targetPos, delta * 4);
      controls.target.lerp(target, delta * 4);
      controls.update();

      if (camera.position.distanceTo(targetPos) < 0.1) {
        setTarget(null);
        setTargetPos(null);
        if (onClearView) onClearView();
      }
    }
  });

  return null;
}

function Model({
  onPlantClick,
  sickPlants,
  focusPlant,
  isPanelOpen,
  onSetCameraFocus,
}) {
  const { scene } = useGLTF("/models/test/model.glb");
  const [markers, setMarkers] = useState([]);

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

    scaledScene.updateMatrixWorld(true);

    scaledScene.traverse((child) => {
      if (child.isMesh && child.name.includes("Plant")) {
        if (!child.userData.originalColor) {
          child.userData.originalColor = child.material.color.clone();
          child.userData.plantId = currentPlantCounter;
        }

        if (
          sickPlants.some((sick) => sick.plantIndex === child.userData.plantId)
        ) {
          child.material = child.material.clone();
          child.material.color = new THREE.Color("#ef4444");
          child.userData.isSick = true;

          const worldPos = new THREE.Vector3();
          child.getWorldPosition(worldPos);

          newMarkers.push({
            id: child.userData.plantId,
            position: [worldPos.x, worldPos.y + 0.8, worldPos.z],
          });

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
      onSetCameraFocus(foundFocusPos);
    }
  }, [scaledScene, sickPlants, focusPlant, onSetCameraFocus]);

  return (
    <>
      <primitive
        object={scaledScene}
        onClick={(e) => {
          e.stopPropagation();
          if (e.object.userData.plantId !== undefined) {
            onPlantClick(e.object.userData.plantId);
          }
        }}
      />
      {!isPanelOpen &&
        markers.map((marker) => (
          <Html
            key={marker.id}
            position={marker.position}
            center
            zIndexRange={[10, 0]}
          >
            <div
              onClick={(e) => {
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

function ControlButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-3 bg-white/90 hover:bg-white text-slate-700 hover:text-green-600 rounded-xl shadow-sm transition-all group relative border border-white/50"
    >
      <Icon className="w-5 h-5" />
      <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
        {label}
      </span>
    </button>
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
  isPanelOpen = false,
}) {
  const [customView, setCustomView] = useState(null);
  const [cameraFocusTarget, setCameraFocusTarget] = useState(null);

  return (
    <div className="w-full h-full relative">
      {/* FLOATING CAMERA CONTROLS TOOLBAR */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3 bg-slate-400/20 backdrop-blur-xl p-2.5 rounded-2xl border border-white/10 shadow-2xl">
        <ControlButton
          icon={Home}
          label="Reset View"
          onClick={() => setCustomView({ pos: [5, 5, 5], target: [0, 0, 0] })}
        />
        <ControlButton
          icon={Box}
          label="Top View"
          onClick={() => setCustomView({ pos: [0, 12, 0], target: [0, 0, 0] })}
        />
        <ControlButton
          icon={Grid}
          label="Side View"
          onClick={() => setCustomView({ pos: [10, 2, 0], target: [0, 0, 0] })}
        />
        {/* NEW: Inside "Middle of Farm" View */}
        <ControlButton
          icon={Focus}
          label="Inside View"
          onClick={() =>
            setCustomView({ pos: [0, 1.5, 0], target: [5, 1.5, 0] })
          }
        />
        <div className="w-full h-px bg-white/20 my-1" /> {/* Divider */}
        <ControlButton
          icon={ZoomIn}
          label="Zoom In"
          onClick={() => setCustomView({ action: "zoomIn" })}
        />
        <ControlButton
          icon={ZoomOut}
          label="Zoom Out"
          onClick={() => setCustomView({ action: "zoomOut" })}
        />
      </div>

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

        <CameraRig
          focusPos={cameraFocusTarget}
          customView={customView}
          onClearView={() => setCustomView(null)}
        />

        <Suspense fallback={<Loader />}>
          <Model
            onPlantClick={onPlantClick}
            sickPlants={sickPlants}
            focusPlant={focusPlant}
            isPanelOpen={isPanelOpen}
            onSetCameraFocus={setCameraFocusTarget}
          />
        </Suspense>
        <OrbitControls makeDefault />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}