// "use client";
// import React, { useEffect, Suspense } from "react";
// import { Canvas, useThree } from "@react-three/fiber";
// import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei";
// import * as THREE from "three";

// function DebugInfo({ scene }) {
//   return null;
// }

// function Model({ onPlantClick, sickPlants }) {
//   const { scene } = useGLTF("/models/test/model.glb");

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

//   // 4 & 5: DYNAMICALLY HIGHLIGHT SPECIFIC PLANTS
//   // 4 & 5: DYNAMICALLY HIGHLIGHT SPECIFIC PLANTS AND COUNT THEM
//   useEffect(() => {
//     let currentPlantCounter = 0;
//     let plantNamesForAdmin = []; // Array to hold the names

//     scaledScene.traverse((child) => {
//       if (child.isMesh) {
//         child.castShadow = true;
//         child.receiveShadow = true;

//         if (child.name.includes("Plant")) {
//           // Log the plant to our array
//           plantNamesForAdmin.push({
//             index: currentPlantCounter,
//             meshName: child.name,
//           });

//           // Store original color on first load
//           if (!child.userData.originalColor) {
//             child.userData.originalColor = child.material.color.clone();
//             child.userData.plantId = currentPlantCounter; // Assign ID
//           }

//           // Check if this specific plant's ID is inside our sickPlants array
//           if (sickPlants.includes(child.userData.plantId)) {
//             child.material = child.material.clone();
//             child.material.color = new THREE.Color("#ef4444"); // Turn it RED
//             child.userData.isSick = true;
//           } else {
//             // Otherwise, keep it healthy/normal
//             child.material.color = child.userData.originalColor;
//             child.userData.isSick = false;
//           }

//           currentPlantCounter++;
//         }
//       }
//     });

//     // PRINT THE TOTAL COUNT TO THE CONSOLE
//     console.log(
//       `🌿 3D MODEL LOADED: Found exactly ${currentPlantCounter} plants!`,
//     );
//     console.log(
//       "Here is the exact index mapping for the Admin:",
//       plantNamesForAdmin,
//     );
//   }, [scaledScene, sickPlants]);

//   return (
//     <primitive
//       object={scaledScene}
//       onClick={(e) => {
//         e.stopPropagation();
//         if (e.object.userData.isSick) {
//           // Pass the specific ID back to page.js so the UI knows which one you clicked
//           onPlantClick(`Sector-Node-${e.object.userData.plantId}`);
//         }
//       }}
//     />
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

// export default function DigitalTwin({ onPlantClick, sickPlants = [] }) {
//   return (
//     <div className="w-full h-full">
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
//         <Suspense fallback={<Loader />}>
//           <Model onPlantClick={onPlantClick} sickPlants={sickPlants} />
//         </Suspense>
//         <OrbitControls makeDefault />
//         <Environment preset="city" />
//       </Canvas>
//     </div>
//   );
// }
"use client";
import React, { useEffect, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

function DebugInfo({ scene }) {
  return null;
}

function Model({ onPlantClick, sickPlants }) {
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
    return scene;
  }, [scene]);

  useEffect(() => {
    let currentPlantCounter = 0;

    scaledScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.name.includes("Plant")) {
          if (!child.userData.originalColor) {
            child.userData.originalColor = child.material.color.clone();
            child.userData.plantId = currentPlantCounter;
          }

          // FIX: Use .plantIndex instead of .index to match page.js
          if (
            sickPlants.some(
              (sick) => sick.plantIndex === child.userData.plantId,
            )
          ) {
            child.material = child.material.clone();
            child.material.color = new THREE.Color("#ef4444");
            child.userData.isSick = true;
          } else {
            child.material.color = child.userData.originalColor;
            child.userData.isSick = false;
          }

          currentPlantCounter++;
        }
      }
    });
  }, [scaledScene, sickPlants]);

  return (
    <primitive
      object={scaledScene}
      onClick={(e) => {
        e.stopPropagation();

        // FIX: Only trigger the click if the mesh actually has a plantId (ignore the ground!)
        if (e.object.userData.plantId !== undefined) {
          onPlantClick(e.object.userData.plantId);
        }
      }}
    />
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

export default function DigitalTwin({ onPlantClick, sickPlants = [] }) {
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
          <Model onPlantClick={onPlantClick} sickPlants={sickPlants} />
        </Suspense>
        {/* Tip: Use left click to rotate, right click to pan, and scroll to zoom to find the red plants! */}
        <OrbitControls makeDefault />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
