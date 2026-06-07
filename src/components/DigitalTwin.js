// "use client";
// import React, { useEffect, useState, Suspense } from "react";
// import { Canvas, useThree, useFrame } from "@react-three/fiber";
// import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei";
// import * as THREE from "three";
// import {
//   AlertTriangle,
//   Home,
//   Box,
//   Grid,
//   ZoomIn,
//   ZoomOut,
//   Focus,
// } from "lucide-react";

// function CameraRig({ focusPos, customView, onClearView }) {
//   const { camera } = useThree();
//   const controls = useThree((state) => state.controls);
//   const [target, setTarget] = useState(null);
//   const [targetPos, setTargetPos] = useState(null);

//   useEffect(() => {
//     if (focusPos) {
//       setTarget(new THREE.Vector3(focusPos.x, focusPos.y, focusPos.z));
//       setTargetPos(
//         new THREE.Vector3(focusPos.x + 1.5, focusPos.y + 1.5, focusPos.z + 2),
//       );
//     }
//   }, [focusPos]);

//   useEffect(() => {
//     if (customView && controls) {
//       if (customView.action === "zoomIn" || customView.action === "zoomOut") {
//         const dir = camera.position.clone().sub(controls.target).normalize();
//         const dist = camera.position.distanceTo(controls.target);
//         const modifier = customView.action === "zoomIn" ? -2 : 2;
//         const newDist = Math.max(1, dist + modifier);

//         setTargetPos(controls.target.clone().add(dir.multiplyScalar(newDist)));
//         setTarget(controls.target.clone());
//       } else {
//         setTargetPos(new THREE.Vector3(...customView.pos));
//         setTarget(new THREE.Vector3(...customView.target));
//       }
//     }
//   }, [customView, camera, controls]);

//   useFrame((state, delta) => {
//     if (target && targetPos && controls) {
//       camera.position.lerp(targetPos, delta * 4);
//       controls.target.lerp(target, delta * 4);
//       controls.update();

//       if (camera.position.distanceTo(targetPos) < 0.1) {
//         setTarget(null);
//         setTargetPos(null);
//         if (onClearView) onClearView();
//       }
//     }
//   });

//   return null;
// }

// function Model({
//   onPlantClick,
//   sickPlants,
//   focusPlant,
//   isPanelOpen,
//   onSetCameraFocus,
// }) {
//   const { scene } = useGLTF("/models/test/model.glb");
//   const [markers, setMarkers] = useState([]);

//   const scaledScene = React.useMemo(() => {
//     const box = new THREE.Box3().setFromObject(scene);
//     const size = box.getSize(new THREE.Vector3());
//     const center = box.getCenter(new THREE.Vector3());
//     scene.position.x -= center.x;
//     scene.position.z -= center.z;
//     scene.position.y -= box.min.y;
//     const maxDim = Math.max(size.x, size.y, size.z);
//     if (maxDim > 0) {
//       const scaleFactor = 10 / maxDim;
//       scene.scale.set(scaleFactor, scaleFactor, scaleFactor);
//     }
//     return scene;
//   }, [scene]);

//   useEffect(() => {
//     let currentPlantCounter = 0;
//     let newMarkers = [];
//     let foundFocusPos = null;

//     scaledScene.updateMatrixWorld(true);

//     scaledScene.traverse((child) => {
//       if (child.isMesh && child.name.includes("Plant")) {
//         if (!child.userData.originalColor) {
//           child.userData.originalColor = child.material.color.clone();
//           child.userData.plantId = currentPlantCounter;
//         }

//         if (
//           sickPlants.some((sick) => sick.plantIndex === child.userData.plantId)
//         ) {
//           child.material = child.material.clone();
//           child.material.color = new THREE.Color("#ef4444");
//           child.userData.isSick = true;

//           const worldPos = new THREE.Vector3();
//           child.getWorldPosition(worldPos);

//           newMarkers.push({
//             id: child.userData.plantId,
//             position: [worldPos.x, worldPos.y + 0.8, worldPos.z],
//           });

//           if (focusPlant === child.userData.plantId) {
//             foundFocusPos = worldPos;
//           }
//         } else {
//           child.material.color = child.userData.originalColor;
//           child.userData.isSick = false;
//         }
//         currentPlantCounter++;
//       }
//     });

//     setMarkers(newMarkers);
//     if (foundFocusPos) {
//       onSetCameraFocus(foundFocusPos);
//     }
//   }, [scaledScene, sickPlants, focusPlant, onSetCameraFocus]);

//   return (
//     <>
//       <primitive
//         object={scaledScene}
//         onClick={(e) => {
//           e.stopPropagation();
//           if (e.object.userData.plantId !== undefined) {
//             onPlantClick(e.object.userData.plantId);
//           }
//         }}
//       />
//       {!isPanelOpen &&
//         markers.map((marker) => (
//           <Html
//             key={marker.id}
//             position={marker.position}
//             center
//             zIndexRange={[10, 0]}
//           >
//             <div
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onPlantClick(marker.id);
//               }}
//               className="animate-bounce bg-red-600/90 backdrop-blur-sm text-white p-2 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.7)] cursor-pointer hover:bg-red-500 transition-colors border border-red-400"
//             >
//               <AlertTriangle className="w-5 h-5" />
//             </div>
//           </Html>
//         ))}
//     </>
//   );
// }

// function ControlButton({ icon: Icon, label, onClick }) {
//   return (
//     <button
//       onClick={onClick}
//       className="p-3 bg-white/90 hover:bg-white text-slate-700 hover:text-green-600 rounded-xl shadow-sm transition-all group relative border border-white/50"
//     >
//       <Icon className="w-5 h-5" />
//       <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
//         {label}
//       </span>
//     </button>
//   );
// }

// function Loader() {
//   return (
//     <Html center>
//       <div className="text-white font-bold animate-pulse">
//         Loading Digital Twin...
//       </div>
//     </Html>
//   );
// }

// export default function DigitalTwin({
//   onPlantClick,
//   sickPlants = [],
//   focusPlant = null,
//   isPanelOpen = false,
// }) {
//   const [customView, setCustomView] = useState(null);
//   const [cameraFocusTarget, setCameraFocusTarget] = useState(null);

//   return (
//     <div className="w-full h-full relative">
//       {/* FLOATING CAMERA CONTROLS TOOLBAR */}
//       <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3 bg-slate-400/20 backdrop-blur-xl p-2.5 rounded-2xl border border-white/10 shadow-2xl">
//         <ControlButton
//           icon={Home}
//           label="Reset View"
//           onClick={() => setCustomView({ pos: [5, 5, 5], target: [0, 0, 0] })}
//         />
//         <ControlButton
//           icon={Box}
//           label="Top View"
//           onClick={() => setCustomView({ pos: [0, 12, 0], target: [0, 0, 0] })}
//         />
//         <ControlButton
//           icon={Grid}
//           label="Side View"
//           onClick={() => setCustomView({ pos: [10, 2, 0], target: [0, 0, 0] })}
//         />
//         {/* NEW: Inside "Middle of Farm" View */}
//         <ControlButton
//           icon={Focus}
//           label="Inside View"
//           onClick={() =>
//             setCustomView({ pos: [0, 1.5, 0], target: [5, 1.5, 0] })
//           }
//         />
//         <div className="w-full h-px bg-white/20 my-1" /> {/* Divider */}
//         <ControlButton
//           icon={ZoomIn}
//           label="Zoom In"
//           onClick={() => setCustomView({ action: "zoomIn" })}
//         />
//         <ControlButton
//           icon={ZoomOut}
//           label="Zoom Out"
//           onClick={() => setCustomView({ action: "zoomOut" })}
//         />
//       </div>

//       <Canvas
//         shadows
//         legacy={true}
//         frameloop="always"
//         gl={{ antialias: true }}
//         camera={{ position: [5, 5, 5], fov: 50 }}
//       >
//         <ambientLight intensity={2} />
//         <directionalLight position={[10, 10, 5]} intensity={2} />
//         <gridHelper args={[20, 20]} />
//         <axesHelper args={[5]} />

//         <CameraRig
//           focusPos={cameraFocusTarget}
//           customView={customView}
//           onClearView={() => setCustomView(null)}
//         />

//         <Suspense fallback={<Loader />}>
//           <Model
//             onPlantClick={onPlantClick}
//             sickPlants={sickPlants}
//             focusPlant={focusPlant}
//             isPanelOpen={isPanelOpen}
//             onSetCameraFocus={setCameraFocusTarget}
//           />
//         </Suspense>
//         <OrbitControls makeDefault />
//         {/* <Environment preset="city" /> */}
//         <Environment files="potsdamer_platz_4k.exr" />
//       </Canvas>
//     </div>
//   );
// }

"use client";
import React, { useEffect, useState, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  AlertTriangle,
  Home,
  Box,
  Grid,
  ZoomIn,
  ZoomOut,
  Focus,
} from "lucide-react";

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

// function Model({
//   onPlantClick,
//   sickPlants,
//   focusPlant,
//   isPanelOpen,
//   onSetCameraFocus,
//   nodesStatus, // 🟢 AJOUTÉ: Données MongoDB pour le risque
// }) {
//   const { scene } = useGLTF("/models/test/model.glb");
//   const [markers, setMarkers] = useState([]);

//   const scaledScene = React.useMemo(() => {
//     const box = new THREE.Box3().setFromObject(scene);
//     const size = box.getSize(new THREE.Vector3());
//     const center = box.getCenter(new THREE.Vector3());
//     scene.position.x -= center.x;
//     scene.position.z -= center.z;
//     scene.position.y -= box.min.y;
//     const maxDim = Math.max(size.x, size.y, size.z);
//     if (maxDim > 0) {
//       const scaleFactor = 10 / maxDim;
//       scene.scale.set(scaleFactor, scaleFactor, scaleFactor);
//     }
//     return scene;
//   }, [scene]);

//   useEffect(() => {
//     let currentPlantCounter = 0;
//     let newMarkers = [];
//     let foundFocusPos = null;

//     scaledScene.updateMatrixWorld(true);

//     scaledScene.traverse((child) => {
//       if (child.isMesh && child.name.includes("Plant")) {
//         if (!child.userData.originalColor) {
//           child.userData.originalColor = child.material.color.clone();
//           child.userData.plantId = currentPlantCounter;
//         }

//         const plantId = child.userData.plantId;
//         const isSick = sickPlants.some((sick) => sick.plantIndex === plantId);

//         // 🟢 NOUVEAU: On cherche si la plante est à risque dans la base de données
//         const dbNode = nodesStatus?.find((n) => n.node_id === plantId);
//         const isAtRisk = dbNode?.trend === "at_risk" && !isSick;

//         if (isSick) {
//           // Plante malade (ROUGE)
//           child.material = child.material.clone();
//           child.material.color = new THREE.Color("#ef4444");
//           child.userData.isSick = true;

//           const worldPos = new THREE.Vector3();
//           child.getWorldPosition(worldPos);

//           newMarkers.push({
//             id: plantId,
//             position: [worldPos.x, worldPos.y + 0.8, worldPos.z],
//             type: "sick", // 🟢 On précise le type de marqueur
//           });

//           if (focusPlant === plantId) {
//             foundFocusPos = worldPos;
//           }
//         } else if (isAtRisk) {
//           // 🟢 Plante à risque (ORANGE)
//           child.material = child.material.clone();
//           child.material.color = new THREE.Color("#f97316"); // On colore aussi la plante en orange !
//           child.userData.isSick = false;

//           const worldPos = new THREE.Vector3();
//           child.getWorldPosition(worldPos);

//           newMarkers.push({
//             id: plantId,
//             position: [worldPos.x, worldPos.y + 0.8, worldPos.z],
//             type: "risk",
//             riskValue: dbNode?.spread_risk, // Pour l'afficher au survol
//           });
//         } else {
//           // Plante saine (VERT/ORIGINAL)
//           child.material.color = child.userData.originalColor;
//           child.userData.isSick = false;
//         }
//         currentPlantCounter++;
//       }
//     });

//     setMarkers(newMarkers);
//     if (foundFocusPos) {
//       onSetCameraFocus(foundFocusPos);
//     }
//   }, [scaledScene, sickPlants, focusPlant, onSetCameraFocus, nodesStatus]);

//   return (
//     <>
//       <primitive
//         object={scaledScene}
//         onClick={(e) => {
//           e.stopPropagation();
//           if (e.object.userData.plantId !== undefined) {
//             onPlantClick(e.object.userData.plantId);
//           }
//         }}
//       />
//       {!isPanelOpen &&
//         markers.map((marker) => (
//           <Html
//             key={marker.id}
//             position={marker.position}
//             center
//             zIndexRange={[10, 0]}
//           >
//             {marker.type === "sick" ? (
//               // 🔴 ALERTE ROUGE (Maladie confirmée)
//               <div
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onPlantClick(marker.id);
//                 }}
//                 className="animate-bounce bg-red-600/90 backdrop-blur-sm text-white p-2 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.7)] cursor-pointer hover:bg-red-500 transition-colors border border-red-400"
//               >
//                 <AlertTriangle className="w-5 h-5" />
//               </div>
//             ) : (
//               // 🟠 ALERTE ORANGE (Risque de propagation spatial)
//               <div
//                 title={`Risk of Spreading: ${(marker.riskValue * 100).toFixed(0)}%`}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onPlantClick(marker.id);
//                 }}
//                 className="relative flex h-6 w-6 cursor-pointer items-center justify-center mt-4"
//               >
//                 <span
//                   className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"
//                   style={{ animationDuration: "2.5s" }}
//                 />
//                 <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 border border-white shadow-lg" />
//               </div>
//             )}
//           </Html>
//         ))}
//     </>
//   );
// }
function Model({
  onPlantClick,
  sickPlants,
  focusPlant,
  isPanelOpen,
  onSetCameraFocus,
  nodesStatus,
}) {
  const { scene } = useGLTF("/models/test/model.glb");
  const [markers, setMarkers] = useState([]);

  // 🟢 VARIABLE MAGIQUE POUR LE JURY : Mets à "true" pour voir les numéros !
  const SHOW_DEBUG_IDS = false;

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
    let newMarkers = [];
    let foundFocusPos = null;

    scaledScene.updateMatrixWorld(true);

    const plantMeshes = [];
    scaledScene.traverse((child) => {
      if (child.isMesh && child.name.includes("Plant")) {
        plantMeshes.push(child);
      }
    });

    // 🟢 1. L'ALGORITHME BULLETPROOF : Trouver le vrai centre géométrique
    const getTrueCenter = (mesh) => {
      mesh.geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      mesh.geometry.boundingBox.getCenter(center);
      mesh.localToWorld(center);
      return center;
    };

    // 🟢 2. LE TRI SPATIAL CORRIGÉ
    // 🟢 2. LE TRI SPATIAL CORRIGÉ (Séparation par Couloir)
    plantMeshes.sort((a, b) => {
      const posA = getTrueCenter(a);
      const posB = getTrueCenter(b);

      // 1. SÉPARER GAUCHE / DROITE par rapport au couloir central (Axe X = 0)
      const sideA = posA.x < 0 ? -1 : 1;
      const sideB = posB.x < 0 ? -1 : 1;

      if (sideA !== sideB) {
        return sideA - sideB; // Les plantes de gauche d'abord, puis celles de droite !
      }

      // 2. RANGER PAR PROFONDEUR (Axe Z) sur la MÊME table
      // On regroupe les plantes dans des "bandes" virtuelles (1.2m d'épaisseur)
      const bandA = Math.round(posA.z / 1.2);
      const bandB = Math.round(posB.z / 1.2);

      if (bandA !== bandB) {
        return bandA - bandB; // Tri de l'avant vers l'arrière
      }

      // 3. RANGER PAR LARGEUR (Axe X) sur la même rangée
      return posA.x - posB.x;
    });

    // 🟢 3. Assignation des bons IDs après le tri spatial
    plantMeshes.forEach((child, index) => {
      if (!child.userData.originalColor) {
        child.userData.originalColor = child.material.color.clone();
      }

      child.userData.plantId = index;
      const plantId = child.userData.plantId;

      const isSick = sickPlants.some((sick) => sick.plantIndex === plantId);
      const dbNode = nodesStatus?.find((n) => n.node_id === plantId);
      const isAtRisk = dbNode?.trend === "at_risk" && !isSick;

      // ... (Logique de coloration inchangée) ...
      if (isSick) {
        child.material = child.material.clone();
        child.material.color = new THREE.Color("#ef4444");
        child.userData.isSick = true;

        const worldPos = getTrueCenter(child);
        newMarkers.push({
          id: plantId,
          position: [worldPos.x, worldPos.y + 0.8, worldPos.z],
          type: "sick",
        });

        if (focusPlant === plantId) foundFocusPos = worldPos;
      } else if (isAtRisk) {
        child.material = child.material.clone();
        child.material.color = new THREE.Color("#f97316");
        child.userData.isSick = false;

        const worldPos = getTrueCenter(child);
        newMarkers.push({
          id: plantId,
          position: [worldPos.x, worldPos.y + 0.8, worldPos.z],
          type: "risk",
          riskValue: dbNode?.spread_risk,
        });
      } else {
        child.material.color = child.userData.originalColor;
        child.userData.isSick = false;

        // En mode Debug, on veut quand même voir les IDs des plantes saines !
        if (SHOW_DEBUG_IDS) {
          const worldPos = getTrueCenter(child);
          newMarkers.push({
            id: plantId,
            position: [worldPos.x, worldPos.y + 0.8, worldPos.z],
            type: "healthy_debug",
          });
        }
      }
    });

    setMarkers(newMarkers);
    if (foundFocusPos) onSetCameraFocus(foundFocusPos);
  }, [
    scaledScene,
    sickPlants,
    focusPlant,
    onSetCameraFocus,
    nodesStatus,
    SHOW_DEBUG_IDS,
  ]);

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
            <div className="flex flex-col items-center">
              {/* 🟢 LE LABEL DEBUG */}
              {SHOW_DEBUG_IDS && (
                <div className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded border border-white/20 mb-1 pointer-events-none">
                  {marker.id}
                </div>
              )}

              {/* Les Alertes Visuelles */}
              {marker.type === "sick" && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlantClick(marker.id);
                  }}
                  className="animate-bounce bg-red-600/90 backdrop-blur-sm text-white p-2 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.7)] cursor-pointer hover:bg-red-500 border border-red-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <path d="M12 9v4"></path>
                    <path d="M12 17h.01"></path>
                  </svg>
                </div>
              )}

              {marker.type === "risk" && (
                <div
                  title={`Risk of Spreading: ${(marker.riskValue * 100).toFixed(0)}%`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlantClick(marker.id);
                  }}
                  className="relative flex h-6 w-6 cursor-pointer items-center justify-center mt-2"
                >
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"
                    style={{ animationDuration: "2.5s" }}
                  />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 border border-white shadow-lg" />
                </div>
              )}
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
  nodesStatus = [], // 🟢 AJOUTÉ: On reçoit les données depuis page.js
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
        <ControlButton
          icon={Focus}
          label="Inside View"
          onClick={() =>
            setCustomView({ pos: [0, 1.5, 0], target: [5, 1.5, 0] })
          }
        />
        <div className="w-full h-px bg-white/20 my-1" />
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
            nodesStatus={nodesStatus} // 🟢 AJOUTÉ: On passe les données au Model
          />
        </Suspense>
        <OrbitControls makeDefault />
        <Environment files="potsdamer_platz_4k.exr" />
      </Canvas>
    </div>
  );
}
