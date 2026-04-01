// "use client";
// import { useState, useEffect, useRef } from "react";
// import Navbar from "@/components/Navbar";
// import DigitalTwin from "@/components/DigitalTwin";
// import DiagnosisPanel from "@/components/DiagnosisPanel";
// import HomeDashboard from "@/components/HomeDashboard";
// import AnalyticsDashboard from "@/components/AnalyticsDashboard";
// import { Client } from "@gradio/client";

// export default function Home() {
//   const [currentView, setCurrentView] = useState("home");
//   const [selectedPlantInfo, setSelectedPlantInfo] = useState(null);
//   const [weather, setWeather] = useState({ temp: "--", humid: "--" });

//   const [alerts, setAlerts] = useState([]);
//   const [sickPlants, setSickPlants] = useState([]);
//   const [focusPlant, setFocusPlant] = useState(null);

//   const [isScouting, setIsScouting] = useState(false);
//   const scoutingRef = useRef(isScouting);
//   const currentIndexRef = useRef(0);

//   useEffect(() => {
//     fetch(
//       `https://api.open-meteo.com/v1/forecast?latitude=36.62&longitude=3.22&current=temperature_2m,relative_humidity_2m`,
//     )
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.current) {
//           setWeather({
//             temp: Math.round(data.current.temperature_2m) + "°C",
//             humid: data.current.relative_humidity_2m + "%",
//           });
//         }
//       })
//       .catch((err) => console.error("Weather fetch failed", err));
//   }, []);

//   const toggleScouting = () => {
//     const newState = !isScouting;
//     setIsScouting(newState);
//     scoutingRef.current = newState;
//   };

//   useEffect(() => {
//     if (!isScouting) return;

//     const specificImages = [
//       "p.jpg",
//       "rust.jpg",
//       "rust3.jpg",
//       "sc.jpg",
//       "2.jpg",
//       "3d.jpg",
//       "complex.jpg",
//       "f2.jpg",
//     ];

//     // NEW: We pick 8 scattered locations across the farm (Sectors A through G)
//     // You can change these numbers (0-71) to move the red plants anywhere you want!
//     const sickIndices = [3, 14, 25, 38, 47, 52, 61, 68];

//     let healthyCounter = 1;

//     const cameraScoutData = Array.from({ length: 72 }).map((_, index) => {
//       let fileName = "";
//       const sickPosition = sickIndices.indexOf(index);

//       if (sickPosition !== -1) {
//         // If this index is one of our scattered sick spots, assign the specific disease image
//         fileName = `/scout_cameras/${specificImages[sickPosition]}`;
//       } else {
//         // Otherwise, pull the next healthy image in the sequence (1 to 64)
//         fileName = `/scout_cameras/healthy${healthyCounter}.jpg`;
//         healthyCounter++;
//       }

//       const sectorLetter = String.fromCharCode(65 + Math.floor(index / 10));
//       const rowNum = (index % 10) + 1;

//       return {
//         file: fileName,
//         nodeName: `Sector ${sectorLetter} - Row ${rowNum}`,
//         plantIndex: index,
//       };
//     });
//     const runScout = async () => {
//       console.log("🚀 AI Scout Initiated.");
//       for (let i = currentIndexRef.current; i < cameraScoutData.length; i++) {
//         if (!scoutingRef.current) {
//           console.log("⏸️ AI Scout Paused.");
//           break;
//         }

//         currentIndexRef.current = i;
//         const currentCamera = cameraScoutData[i];
//         console.log(
//           `📷 Checking Image ${i + 1}/72: ${currentCamera.nodeName}...`,
//         );

//         try {
//           const response = await fetch(currentCamera.file);
//           const blob = await response.blob();
//           const file = new File([blob], "scout_capture.jpg", {
//             type: blob.type,
//           });

//           // Replace Gradio call with local backend
//           const formData = new FormData();
//           formData.append("image", file);

//           const scoutResponse = await fetch("http://localhost:8000/scout", {
//             method: "POST",
//             body: formData,
//           });

//           const result = await scoutResponse.json();
//           const rawOutput = result.label || "";

//           if (rawOutput.toLowerCase().includes("unhealthy")) {
//             const newAlert = {
//               id: Date.now(),
//               title: `Pathogen Detected`,
//               time: new Date().toLocaleTimeString([], {
//                 hour: "2-digit",
//                 minute: "2-digit",
//               }),
//               node: currentCamera.nodeName,
//               plantIndex: currentCamera.plantIndex,
//             };
//             setAlerts((prev) => [newAlert, ...prev].slice(0, 5));
//             setSickPlants((prev) => {
//               if (!prev.find((p) => p.plantIndex === currentCamera.plantIndex))
//                 return [...prev, currentCamera];
//               return prev;
//             });
//           }
//         } catch (error) {
//           console.error(`Scout AI Error on ${currentCamera.nodeName}:`, error);
//         }

//         await new Promise((resolve) => setTimeout(resolve, 800));
//       }

//       if (
//         currentIndexRef.current >= cameraScoutData.length - 1 &&
//         scoutingRef.current
//       ) {
//         console.log("✅ Automated Scout: Cycle Complete.");
//         setIsScouting(false);
//         scoutingRef.current = false;
//         currentIndexRef.current = 0;
//       }
//     };

//     runScout();
//     return () => {
//       scoutingRef.current = false;
//     };
//   }, [isScouting]);

//   const handlePlantClick = (clickedIndex) => {
//     if (clickedIndex === undefined) return;
//     const sickData = sickPlants.find((p) => p.plantIndex === clickedIndex);
//     if (sickData) {
//       setSelectedPlantInfo({ id: sickData.nodeName, autoImage: sickData.file });
//     } else {
//       setSelectedPlantInfo({
//         id: `Healthy Node ID: ${clickedIndex}`,
//         manualFile: null,
//       });
//     }
//   };

//   const handleAlertClick = (plantIndex) => {
//     setCurrentView("3dmodel");
//     setFocusPlant(plantIndex);
//     setSelectedPlantInfo(null);
//   };

//   const handleManualUpload = (file) => {
//     setSelectedPlantInfo({ id: "Manual Quick-Check", manualFile: file });
//   };

//   const isPanelOpen = !!selectedPlantInfo;

//   return (
//     <main className="h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col font-sans overflow-hidden relative">
//       <Navbar
//         setView={setCurrentView}
//         currentView={currentView}
//         alerts={alerts}
//       />
//       <div className="flex-1 overflow-y-auto p-8 relative">
//         {currentView === "home" && (
//           <HomeDashboard
//             weather={weather}
//             alerts={alerts}
//             onAlertClick={handleAlertClick}
//             onManualUpload={handleManualUpload}
//             totalPlants={72}
//             sickCount={sickPlants.length}
//             isPanelOpen={isPanelOpen}
//             isScouting={isScouting}
//             onToggleScouting={toggleScouting}
//           />
//         )}
//         {currentView === "3dmodel" && (
//           <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white relative bg-gradient-to-b from-slate-900 to-slate-800 animate-in zoom-in-95 duration-500">
//             <div
//               className={`absolute top-8 left-8 z-10 px-5 py-2.5 rounded-full backdrop-blur-xl text-xs font-black tracking-widest uppercase flex items-center gap-3 border ${isScouting ? "bg-black/40 text-white border-white/10" : "bg-yellow-500/80 text-slate-900 border-yellow-300"}`}
//             >
//               <span className="relative flex h-2 w-2">
//                 <span
//                   className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isScouting ? "bg-green-400" : "bg-yellow-400"}`}
//                 ></span>
//                 <span
//                   className={`relative inline-flex rounded-full h-2 w-2 ${isScouting ? "bg-green-500" : "bg-yellow-600"}`}
//                 ></span>
//               </span>
//               {isScouting
//                 ? "Digital Twin Sync: LIVE"
//                 : "Digital Twin Sync: PAUSED"}
//             </div>
//             <DigitalTwin
//               onPlantClick={handlePlantClick}
//               sickPlants={sickPlants}
//               focusPlant={focusPlant}
//               isPanelOpen={isPanelOpen}
//             />
//           </div>
//         )}
//         {/* {currentView === "analytics" && <AnalyticsDashboard />} */}
//         {currentView === "analytics" && (
//           <AnalyticsDashboard sickPlants={sickPlants} totalPlants={72} />
//         )}
//       </div>
//       <DiagnosisPanel
//         isOpen={isPanelOpen}
//         plantInfo={selectedPlantInfo}
//         onClose={() => setSelectedPlantInfo(null)}
//       />
//     </main>
//   );
// }

"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import DigitalTwin from "@/components/DigitalTwin";
import DiagnosisPanel from "@/components/DiagnosisPanel";
import HomeDashboard from "@/components/HomeDashboard";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

const BACKEND_URL = "http://localhost:8000";

export default function Home() {
  const [currentView, setCurrentView] = useState("home");
  const [selectedPlantInfo, setSelectedPlantInfo] = useState(null);
  const [weather, setWeather] = useState({ temp: "--", humid: "--" });

  const [alerts, setAlerts] = useState([]);
  const [sickPlants, setSickPlants] = useState([]);
  const [focusPlant, setFocusPlant] = useState(null);

  const [isScouting, setIsScouting] = useState(false);
  const scoutingRef = useRef(isScouting);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=36.62&longitude=3.22&current=temperature_2m,relative_humidity_2m`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m) + "°C",
            humid: data.current.relative_humidity_2m + "%",
          });
        }
      })
      .catch((err) => console.error("Weather fetch failed", err));
  }, []);

  const toggleScouting = () => {
    const newState = !isScouting;
    setIsScouting(newState);
    scoutingRef.current = newState;
  };

  useEffect(() => {
    if (!isScouting) return;

    const specificImages = [
      "p.jpg",
      "rust.jpg",
      "rust3.jpg",
      "sc.jpg",
      "2.jpg",
      "3d.jpg",
      "complex.jpg",
      "f2.jpg",
    ];

    const sickIndices = [3, 14, 25, 38, 47, 52, 61, 68];
    let healthyCounter = 1;

    const cameraScoutData = Array.from({ length: 72 }).map((_, index) => {
      let fileName = "";
      const sickPosition = sickIndices.indexOf(index);

      if (sickPosition !== -1) {
        fileName = `/scout_cameras/${specificImages[sickPosition]}`;
      } else {
        fileName = `/scout_cameras/healthy${healthyCounter}.jpg`;
        healthyCounter++;
      }

      const sectorLetter = String.fromCharCode(65 + Math.floor(index / 10));
      const rowNum = (index % 10) + 1;

      return {
        file: fileName,
        nodeName: `Sector ${sectorLetter} - Row ${rowNum}`,
        plantIndex: index,
      };
    });

    const runScout = async () => {
      console.log("🚀 AI Scout Initiated.");
      for (let i = currentIndexRef.current; i < cameraScoutData.length; i++) {
        if (!scoutingRef.current) {
          console.log("⏸️ AI Scout Paused.");
          break;
        }

        currentIndexRef.current = i;
        const currentCamera = cameraScoutData[i];
        console.log(
          `📷 Checking Image ${i + 1}/72: ${currentCamera.nodeName}...`,
        );

        try {
          const response = await fetch(currentCamera.file);
          const blob = await response.blob();
          const file = new File([blob], "scout_capture.jpg", {
            type: blob.type,
          });

          const formData = new FormData();
          formData.append("image", file);

          const scoutResponse = await fetch(`${BACKEND_URL}/scout`, {
            method: "POST",
            body: formData,
          });

          const result = await scoutResponse.json();
          const rawOutput = result.label || "";

          if (rawOutput.toLowerCase().includes("unhealthy")) {
            const newAlert = {
              id: Date.now(),
              title: `Pathogen Detected`,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              node: currentCamera.nodeName,
              plantIndex: currentCamera.plantIndex,
            };
            setAlerts((prev) => [newAlert, ...prev].slice(0, 5));
            setSickPlants((prev) => {
              if (!prev.find((p) => p.plantIndex === currentCamera.plantIndex))
                return [...prev, currentCamera];
              return prev;
            });
          }
        } catch (error) {
          console.error(`Scout AI Error on ${currentCamera.nodeName}:`, error);
        }

        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      if (
        currentIndexRef.current >= cameraScoutData.length - 1 &&
        scoutingRef.current
      ) {
        console.log("✅ Automated Scout: Cycle Complete.");
        setIsScouting(false);
        scoutingRef.current = false;
        currentIndexRef.current = 0;
      }
    };

    runScout();
    return () => {
      scoutingRef.current = false;
    };
  }, [isScouting]);

  const handlePlantClick = (clickedIndex) => {
    if (clickedIndex === undefined) return;
    const sickData = sickPlants.find((p) => p.plantIndex === clickedIndex);
    if (sickData) {
      setSelectedPlantInfo({ id: sickData.nodeName, autoImage: sickData.file });
    } else {
      setSelectedPlantInfo({
        id: `Healthy Node ID: ${clickedIndex}`,
        manualFile: null,
      });
    }
  };

  const handleAlertClick = (plantIndex) => {
    setCurrentView("3dmodel");
    setFocusPlant(plantIndex);
    setSelectedPlantInfo(null);
  };

  const handleManualUpload = (file) => {
    setSelectedPlantInfo({ id: "Manual Quick-Check", manualFile: file });
  };

  const isPanelOpen = !!selectedPlantInfo;

  return (
    <main className="h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col font-sans overflow-hidden relative">
      <Navbar
        setView={setCurrentView}
        currentView={currentView}
        alerts={alerts}
      />
      <div className="flex-1 overflow-y-auto p-8 relative">
        {currentView === "home" && (
          <HomeDashboard
            weather={weather}
            alerts={alerts}
            onAlertClick={handleAlertClick}
            onManualUpload={handleManualUpload}
            totalPlants={72}
            sickCount={sickPlants.length}
            isPanelOpen={isPanelOpen}
            isScouting={isScouting}
            onToggleScouting={toggleScouting}
          />
        )}
        {currentView === "3dmodel" && (
          <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white relative bg-gradient-to-b from-slate-900 to-slate-800 animate-in zoom-in-95 duration-500">
            <div
              className={`absolute top-8 left-8 z-10 px-5 py-2.5 rounded-full backdrop-blur-xl text-xs font-black tracking-widest uppercase flex items-center gap-3 border ${
                isScouting
                  ? "bg-black/40 text-white border-white/10"
                  : "bg-yellow-500/80 text-slate-900 border-yellow-300"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isScouting ? "bg-green-400" : "bg-yellow-400"}`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${isScouting ? "bg-green-500" : "bg-yellow-600"}`}
                ></span>
              </span>
              {isScouting
                ? "Digital Twin Sync: LIVE"
                : "Digital Twin Sync: PAUSED"}
            </div>
            <DigitalTwin
              onPlantClick={handlePlantClick}
              sickPlants={sickPlants}
              focusPlant={focusPlant}
              isPanelOpen={isPanelOpen}
            />
          </div>
        )}
        {currentView === "analytics" && (
          <AnalyticsDashboard sickPlants={sickPlants} totalPlants={72} />
        )}
      </div>
      <DiagnosisPanel
        isOpen={isPanelOpen}
        plantInfo={selectedPlantInfo}
        onClose={() => setSelectedPlantInfo(null)}
      />
    </main>
  );
}




        // try {
        //   const response = await fetch(currentCamera.file);
        //   const blob = await response.blob();
        //   const file = new File([blob], "scout_capture.jpg", {
        //     type: blob.type,
        //   });
        //   const client = await Client.connect(
        //     "Seroy/Efficientnet_lite0_HealthyVsUnhealthy",
        //   );
        //   const aiResponse = await client.predict("/predict", { image: file });
        //   const prediction = aiResponse.data[0];
        //   const rawOutput =
        //     typeof prediction === "string"
        //       ? prediction
        //       : prediction?.label || "";

        //   if (rawOutput.toLowerCase().includes("unhealthy")) {
        //     const newAlert = {
        //       id: Date.now(),
        //       title: `Pathogen Detected`,
        //       time: new Date().toLocaleTimeString([], {
        //         hour: "2-digit",
        //         minute: "2-digit",
        //       }),
        //       node: currentCamera.nodeName,
        //       plantIndex: currentCamera.plantIndex,
        //     };
        //     setAlerts((prev) => [newAlert, ...prev].slice(0, 5));
        //     setSickPlants((prev) => {
        //       if (!prev.find((p) => p.plantIndex === currentCamera.plantIndex))
        //         return [...prev, currentCamera];
        //       return prev;
        //     });
        //   }
        // } catch (error) {
        //   console.error(`Scout AI Error on ${currentCamera.nodeName}:`, error);
        // }