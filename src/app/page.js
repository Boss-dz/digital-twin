// "use client";
// import { useState, useEffect } from "react";
// import Navbar from "@/components/Navbar";
// import DigitalTwin from "@/components/DigitalTwin";
// import DiagnosisPanel from "@/components/DiagnosisPanel";
// import { Client } from "@gradio/client";
// import {
//   Thermometer,
//   Droplets,
//   Wind,
//   Sun,
//   AlertTriangle,
//   FileText,
//   BarChart3,
//   Video,
//   Zap,
//   ScanSearch,
// } from "lucide-react";

// export default function Home() {
//   const [selectedPlantInfo, setSelectedPlantInfo] = useState(null);
//   const [is3DActive, setIs3DActive] = useState(false);
//   const [currentView, setCurrentView] = useState("overview");
//   const [isReportOpen, setIsReportOpen] = useState(false);
//   const [powerTab, setPowerTab] = useState("energy");
//   const [weather, setWeather] = useState({ temp: "--", humid: "--" });

//   const [alerts, setAlerts] = useState([]);
//   const [sickPlants, setSickPlants] = useState([]);

//   // NEW: State to track which plant the camera should fly to
//   const [focusPlant, setFocusPlant] = useState(null);

//   useEffect(() => {
//     fetch(
//       `https://api.open-meteo.com/v1/forecast?latitude=36.75&longitude=3.05&current=temperature_2m,relative_humidity_2m`,
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

//   // --- AUTOMATED SCOUT LOOP ---
//   useEffect(() => {
//     const cameraScoutData = [
//       {
//         file: "/scout_cameras/healthy1.jpg",
//         nodeName: "Sector A - Row 1",
//         plantIndex: 0,
//       },
//       {
//         file: "/scout_cameras/healthy.jpg",
//         nodeName: "Sector A - Row 2",
//         plantIndex: 12,
//       },
//       {
//         file: "/scout_cameras/scab.jpg",
//         nodeName: "Sector B - Row 1",
//         plantIndex: 25,
//       },
//       {
//         file: "/scout_cameras/scab2.jpg",
//         nodeName: "Sector C - Row 5",
//         plantIndex: 40,
//       },
//     ];

//     let currentIndex = 0;

//     const scoutInterval = setInterval(async () => {
//       if (currentIndex >= cameraScoutData.length) {
//         clearInterval(scoutInterval);
//         return;
//       }

//       const currentCamera = cameraScoutData[currentIndex];

//       try {
//         const response = await fetch(currentCamera.file);
//         const blob = await response.blob();
//         const file = new File([blob], "scout_capture.jpg", { type: blob.type });

//         const client = await Client.connect(
//           "Seroy/Efficientnet_lite0_HealthyVsUnhealthy",
//         );
//         const aiResponse = await client.predict("/predict", { image: file });

//         const prediction = aiResponse.data[0];
//         const rawOutput =
//           typeof prediction === "string" ? prediction : prediction?.label || "";

//         const detectedLabel = rawOutput.toLowerCase();

//         if (detectedLabel.includes("unhealthy")) {
//           const newAlert = {
//             id: Date.now(),
//             title: `Pathogen Warning Detected`,
//             time: new Date().toLocaleTimeString([], {
//               hour: "2-digit",
//               minute: "2-digit",
//             }),
//             node: currentCamera.nodeName,
//           };

//           setAlerts((prev) => [newAlert, ...prev].slice(0, 5));

//           setSickPlants((prev) => {
//             if (!prev.find((p) => p.plantIndex === currentCamera.plantIndex)) {
//               return [...prev, currentCamera];
//             }
//             return prev;
//           });
//         }

//         currentIndex++;
//       } catch (error) {
//         console.error("Scout Camera Loop Error:", error);
//       }
//     }, 10000);

//     return () => clearInterval(scoutInterval);
//   }, []);

//   // Handle clicking a plant in the 3D model
//   const handlePlantClick = (clickedIndex) => {
//     if (clickedIndex === undefined) return;
//     const sickData = sickPlants.find((p) => p.plantIndex === clickedIndex);

//     if (sickData) {
//       setSelectedPlantInfo({ id: sickData.nodeName, autoImage: sickData.file });
//     } else {
//       setSelectedPlantInfo({
//         id: `Plant Node ID: ${clickedIndex}`,
//         autoImage: null,
//       });
//     }
//   };

//   // NEW: Handle clicking the notification alert on the left menu
//   const handleAlertClick = (nodeName) => {
//     const sickData = sickPlants.find((p) => p.nodeName === nodeName);
//     if (sickData) {
//       setIs3DActive(true); // 1. Open the 3D map
//       setFocusPlant(sickData.plantIndex); // 2. Tell the camera to fly there
//       setSelectedPlantInfo(null); // Ensure panel is closed so user can see the flight
//     }
//   };

//   const powerData = {
//     energy: { values: [35, 55, 25, 65, 45, 80, 50], color: "bg-green-500" },
//     storage: { values: [90, 85, 80, 75, 60, 45, 30], color: "bg-blue-500" },
//   };

//   return (
//     <main className="h-screen w-full bg-[#F5F6F8] text-slate-900 flex flex-col font-sans overflow-hidden relative">
//       <Navbar
//         setView={setCurrentView}
//         currentView={currentView}
//         alerts={alerts}
//       />

//       <div className="flex-1 grid grid-cols-[300px_1fr_320px] gap-6 p-6 overflow-hidden min-w-[1280px] overflow-x-auto relative z-0">
//         {/* --- LEFT SIDEBAR --- */}
//         <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1 no-scrollbar">
//           <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
//             <div className="flex justify-between items-start mb-4">
//               <div>
//                 <h2 className="text-lg font-bold text-slate-900 leading-tight">
//                   Current Conditions
//                 </h2>
//                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-1.5">
//                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />{" "}
//                   Live Feed
//                 </p>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <StatCard
//                 label="Air Temp"
//                 value={weather.temp}
//                 icon={Thermometer}
//                 color="text-red-500"
//               />
//               <StatCard
//                 label="Soil"
//                 value="45%"
//                 icon={Droplets}
//                 color="text-blue-500"
//               />
//               <StatCard
//                 label="Humid"
//                 value={weather.humid}
//                 icon={Wind}
//                 color="text-sky-500"
//               />
//               <StatCard
//                 label="Light"
//                 value="1.2k"
//                 icon={Sun}
//                 color="text-yellow-500"
//               />
//             </div>
//           </div>

//           <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-200/60 flex-1">
//             <h3 className="text-sm font-bold text-slate-900 mb-4 flex justify-between items-center">
//               Live IoT Alerts
//               {alerts.length > 0 && (
//                 <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] animate-pulse">
//                   ACTION REQ
//                 </span>
//               )}
//             </h3>
//             <div className="space-y-3">
//               {alerts.length === 0 ? (
//                 <p className="text-xs text-slate-400 font-medium text-center py-4">
//                   All systems clear. Automated scout is running.
//                 </p>
//               ) : (
//                 alerts.map((alert) => (
//                   // UPDATED: Now clicking this uses handleAlertClick to fly the camera
//                   <AlertItem
//                     key={alert.id}
//                     type="critical"
//                     text={`${alert.node} - ${alert.title}`}
//                     onClick={() => handleAlertClick(alert.node)}
//                   />
//                 ))
//               )}
//             </div>
//           </div>
//         </div>

//         {/* --- MIDDLE SECTION --- */}
//         <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-2xl border border-slate-200/50 h-full z-10">
//           {currentView === "overview" &&
//             (!is3DActive ? (
//               <div
//                 onClick={() => setIs3DActive(true)}
//                 className="w-full h-full relative cursor-pointer group"
//               >
//                 <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-all z-10 flex items-center justify-center">
//                   <span className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all font-bold text-slate-900 flex items-center gap-2">
//                     <ScanSearch className="w-5 h-5" /> Open 3D View
//                   </span>
//                 </div>
//                 <img
//                   src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2664&auto=format&fit=crop"
//                   className="w-full h-full object-cover"
//                 />
//                 <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-slate-900/80 to-transparent text-white">
//                   <h2 className="text-4xl font-black">Greenhouse A1</h2>
//                   <p className="text-sm text-white/70 font-bold uppercase tracking-widest mt-1">
//                     Sector ID: GH-A1
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               <div className="w-full h-full bg-slate-900 relative">
//                 <button
//                   onClick={() => setIs3DActive(false)}
//                   className="absolute top-6 right-6 z-50 bg-white text-slate-900 px-5 py-2.5 rounded-full shadow-lg text-xs font-bold transition-all hover:scale-105"
//                 >
//                   Exit 3D View
//                 </button>
//                 {/* NEW: Passed focusPlant into the 3D model */}
//                 <DigitalTwin
//                   onPlantClick={handlePlantClick}
//                   sickPlants={sickPlants}
//                   focusPlant={focusPlant}
//                 />
//               </div>
//             ))}
//         </div>

//         {/* --- RIGHT SIDEBAR --- */}
//         <div className="flex flex-col gap-5 h-full overflow-y-auto pl-1 no-scrollbar">
//           <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-200/60">
//             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center mb-4">
//               Growth Metrics
//             </h3>
//             <div className="flex gap-4">
//               <GaugeCard
//                 value={42}
//                 label="CO2"
//                 sub="ppm"
//                 color="text-green-500"
//               />
//               <GaugeCard
//                 value={5.6}
//                 label="pH"
//                 sub="lv"
//                 color="text-slate-300"
//               />
//             </div>
//           </div>

//           <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-200/60 flex-1 flex flex-col">
//             <h3 className="text-sm font-bold text-slate-900 text-center mb-3">
//               Site Power
//             </h3>
//             <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
//               <button
//                 onClick={() => setPowerTab("storage")}
//                 className={`flex-1 py-1.5 text-[10px] font-black rounded-md transition-all ${powerTab === "storage" ? "bg-white shadow text-blue-600" : "text-slate-400"}`}
//               >
//                 STORAGE
//               </button>
//               <button
//                 onClick={() => setPowerTab("energy")}
//                 className={`flex-1 py-1.5 text-[10px] font-black rounded-md transition-all ${powerTab === "energy" ? "bg-white shadow text-green-600" : "text-slate-400"}`}
//               >
//                 ENERGY
//               </button>
//             </div>

//             <div className="flex-1 flex justify-between items-end gap-2 px-1">
//               {powerData[powerTab].values.map((h, i) => (
//                 <div
//                   key={i}
//                   className="flex-1 bg-slate-100 rounded-t-lg relative group h-full overflow-hidden"
//                 >
//                   <div
//                     className={`absolute bottom-0 w-full transition-all duration-700 ${powerData[powerTab].color} opacity-80 group-hover:opacity-100`}
//                     style={{ height: `${h}%` }}
//                   />
//                 </div>
//               ))}
//             </div>
//             <div className="flex justify-between mt-3 text-[9px] font-bold text-slate-300 font-mono">
//               <span>00:00</span>
//               <span>23:59</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <DiagnosisPanel
//         isOpen={!!selectedPlantInfo}
//         plantInfo={selectedPlantInfo}
//         onClose={() => setSelectedPlantInfo(null)}
//       />
//     </main>
//   );
// }

// function StatCard({ label, value, icon: Icon, color }) {
//   return (
//     <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 transition-all hover:bg-white group">
//       <div className="flex justify-between items-start mb-2">
//         <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
//           {label}
//         </p>
//         <Icon className={`w-3.5 h-3.5 ${color}`} />
//       </div>
//       <div className="text-xl font-black text-slate-900 tracking-tighter">
//         {value}
//       </div>
//     </div>
//   );
// }
// function AlertItem({ type, text, onClick }) {
//   return (
//     <div
//       onClick={onClick}
//       className="flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer bg-red-50 border-red-100 hover:bg-red-100 group"
//     >
//       <AlertTriangle className="w-4 h-4 text-red-500" />
//       <p className="text-xs font-bold text-slate-700 truncate group-hover:text-red-700 transition-colors">
//         Click to locate: {text}
//       </p>
//     </div>
//   );
// }
// function GaugeCard({ value, label, sub, color }) {
//   return (
//     <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center">
//       <div className="relative w-16 h-8 overflow-hidden mb-2">
//         <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-[6px] border-slate-200"></div>
//         <div
//           className={`absolute top-0 left-0 w-16 h-16 rounded-full border-[6px] border-current ${color}`}
//           style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }}
//         ></div>
//       </div>
//       <span className="text-xl font-black text-slate-900">{value}</span>
//       <span className="text-[9px] text-slate-400 font-bold uppercase">
//         {label} <span className="lowercase font-normal">{sub}</span>
//       </span>
//     </div>
//   );
// }
// "use client";
// import { useState, useEffect } from "react";
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

//   // 1. Localized Weather Fetch
//   useEffect(() => {
//     // Points directly to the Blida/Meftah region for hyper-accurate local weather
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

//   // 2. Automated Scout AI Loop
//   useEffect(() => {
//     const cameraScoutData = [
//       {
//         file: "/scout_cameras/healthy1.jpg",
//         nodeName: "Sector A - Row 1",
//         plantIndex: 0,
//       },
//       {
//         file: "/scout_cameras/healthy.jpg",
//         nodeName: "Sector A - Row 2",
//         plantIndex: 12,
//       },
//       {
//         file: "/scout_cameras/scab.jpg",
//         nodeName: "Sector B - Row 1",
//         plantIndex: 25,
//       },
//       {
//         file: "/scout_cameras/scab2.jpg",
//         nodeName: "Sector C - Row 5",
//         plantIndex: 40,
//       },
//     ];

//     let currentIndex = 0;

//     const scoutInterval = setInterval(async () => {
//       if (currentIndex >= cameraScoutData.length) {
//         clearInterval(scoutInterval);
//         return;
//       }

//       const currentCamera = cameraScoutData[currentIndex];

//       try {
//         const response = await fetch(currentCamera.file);
//         const blob = await response.blob();
//         const file = new File([blob], "scout_capture.jpg", { type: blob.type });

//         const client = await Client.connect(
//           "Seroy/Efficientnet_lite0_HealthyVsUnhealthy",
//         );
//         const aiResponse = await client.predict("/predict", { image: file });

//         const prediction = aiResponse.data[0];
//         const rawOutput =
//           typeof prediction === "string" ? prediction : prediction?.label || "";
//         const detectedLabel = rawOutput.toLowerCase();

//         if (detectedLabel.includes("unhealthy")) {
//           const newAlert = {
//             id: Date.now(),
//             title: `Pathogen Detected`,
//             time: new Date().toLocaleTimeString([], {
//               hour: "2-digit",
//               minute: "2-digit",
//             }),
//             node: currentCamera.nodeName,
//             plantIndex: currentCamera.plantIndex,
//           };

//           setAlerts((prev) => [newAlert, ...prev].slice(0, 5));
//           setSickPlants((prev) => {
//             if (!prev.find((p) => p.plantIndex === currentCamera.plantIndex)) {
//               return [...prev, currentCamera];
//             }
//             return prev;
//           });
//         }
//         currentIndex++;
//       } catch (error) {
//         console.error("Scout AI Error:", error);
//       }
//     }, 10000);

//     return () => clearInterval(scoutInterval);
//   }, []);

//   // --- INTERACTION HANDLERS ---

//   const handlePlantClick = (clickedIndex) => {
//     if (clickedIndex === undefined) return;
//     const sickData = sickPlants.find((p) => p.plantIndex === clickedIndex);
//     if (sickData) {
//       setSelectedPlantInfo({ id: sickData.nodeName, autoImage: sickData.file });
//     } else {
//       setSelectedPlantInfo({
//         id: `Plant Node ID: ${clickedIndex}`,
//         autoImage: null,
//       });
//     }
//   };

//   const handleAlertClick = (plantIndex) => {
//     setCurrentView("3dmodel");
//     setFocusPlant(plantIndex);
//     setSelectedPlantInfo(null);
//   };

//   // --- RENDER ROUTER ---
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
//             totalPlants={72}
//             sickCount={sickPlants.length}
//           />
//         )}

//         {currentView === "3dmodel" && (
//           <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white relative bg-gradient-to-b from-slate-900 to-slate-800 animate-in zoom-in-95 duration-500">
//             <div className="absolute top-8 left-8 z-10 bg-black/40 text-white px-5 py-2.5 rounded-full backdrop-blur-xl text-xs font-black tracking-widest uppercase flex items-center gap-3 border border-white/10">
//               <span className="relative flex h-2 w-2">
//                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
//                 <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
//               </span>
//               Digital Twin Sync
//             </div>
//             <DigitalTwin
//               onPlantClick={handlePlantClick}
//               sickPlants={sickPlants}
//               focusPlant={focusPlant}
//             />
//           </div>
//         )}

//         {currentView === "analytics" && <AnalyticsDashboard />}
//       </div>

//       <DiagnosisPanel
//         isOpen={!!selectedPlantInfo}
//         plantInfo={selectedPlantInfo}
//         onClose={() => setSelectedPlantInfo(null)}
//       />
//     </main>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import DigitalTwin from "@/components/DigitalTwin";
import DiagnosisPanel from "@/components/DiagnosisPanel";
import HomeDashboard from "@/components/HomeDashboard";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { Client } from "@gradio/client";

export default function Home() {
  const [currentView, setCurrentView] = useState("home");
  // selectedPlantInfo can now hold: { id, autoImage (url) } OR { id, manualFile (File object) }
  const [selectedPlantInfo, setSelectedPlantInfo] = useState(null);
  const [weather, setWeather] = useState({ temp: "--", humid: "--" });

  const [alerts, setAlerts] = useState([]);
  const [sickPlants, setSickPlants] = useState([]);
  const [focusPlant, setFocusPlant] = useState(null);

  // 1. Localized Weather Fetch (Blida/Meftah region)
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

  // 2. Automated Scout AI Loop
  useEffect(() => {
    const cameraScoutData = [
      {
        file: "/scout_cameras/healthy1.jpg",
        nodeName: "Sector A - Row 1",
        plantIndex: 0,
      },
      {
        file: "/scout_cameras/healthy.jpg",
        nodeName: "Sector A - Row 2",
        plantIndex: 12,
      },
      {
        file: "/scout_cameras/scab.jpg",
        nodeName: "Sector B - Row 1",
        plantIndex: 25,
      },
      {
        file: "/scout_cameras/scab2.jpg",
        nodeName: "Sector C - Row 5",
        plantIndex: 40,
      },
    ];

    let currentIndex = 0;

    const scoutInterval = setInterval(async () => {
      if (currentIndex >= cameraScoutData.length) {
        clearInterval(scoutInterval);
        return;
      }

      const currentCamera = cameraScoutData[currentIndex];

      try {
        const response = await fetch(currentCamera.file);
        const blob = await response.blob();
        const file = new File([blob], "scout_capture.jpg", { type: blob.type });

        const client = await Client.connect(
          "Seroy/Efficientnet_lite0_HealthyVsUnhealthy",
        );
        const aiResponse = await client.predict("/predict", { image: file });

        const prediction = aiResponse.data[0];
        const rawOutput =
          typeof prediction === "string" ? prediction : prediction?.label || "";
        const detectedLabel = rawOutput.toLowerCase();

        if (detectedLabel.includes("unhealthy")) {
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
            if (!prev.find((p) => p.plantIndex === currentCamera.plantIndex)) {
              return [...prev, currentCamera];
            }
            return prev;
          });
        }
        currentIndex++;
      } catch (error) {
        console.error("Scout AI Error:", error);
      }
    }, 10000);

    return () => clearInterval(scoutInterval);
  }, []);

  // --- INTERACTION HANDLERS ---

  // UPDATED: Only open panel if the plant is sick
  const handlePlantClick = (clickedIndex) => {
    if (clickedIndex === undefined) return;
    const sickData = sickPlants.find((p) => p.plantIndex === clickedIndex);

    if (sickData) {
      // It's sick, open the panel with the auto-image
      setSelectedPlantInfo({ id: sickData.nodeName, autoImage: sickData.file });
    }
    // Else: Do nothing for healthy plants
  };

  const handleAlertClick = (plantIndex) => {
    setCurrentView("3dmodel");
    setFocusPlant(plantIndex);
    setSelectedPlantInfo(null);
  };

  // NEW: Handle manual uploads from the Home Dashboard
  const handleManualUpload = (file) => {
    setSelectedPlantInfo({
      id: "Manual Quick-Check",
      manualFile: file, // Pass the actual File object
    });
  };

  // --- RENDER ROUTER ---
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
            // Pass the new handler down
            onManualUpload={handleManualUpload}
            totalPlants={72}
            sickCount={sickPlants.length}
          />
        )}

        {currentView === "3dmodel" && (
          <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white relative bg-gradient-to-b from-slate-900 to-slate-800 animate-in zoom-in-95 duration-500">
            <div className="absolute top-8 left-8 z-10 bg-black/40 text-white px-5 py-2.5 rounded-full backdrop-blur-xl text-xs font-black tracking-widest uppercase flex items-center gap-3 border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Digital Twin Sync
            </div>
            <DigitalTwin
              onPlantClick={handlePlantClick}
              sickPlants={sickPlants}
              focusPlant={focusPlant}
            />
          </div>
        )}

        {currentView === "analytics" && <AnalyticsDashboard />}
      </div>

      <DiagnosisPanel
        isOpen={!!selectedPlantInfo}
        plantInfo={selectedPlantInfo}
        onClose={() => setSelectedPlantInfo(null)}
      />
    </main>
  );
}