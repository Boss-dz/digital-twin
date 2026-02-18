// "use client";
// import { useState, useEffect } from "react";
// import Navbar from "@/components/Navbar";
// import DigitalTwin from "@/components/DigitalTwin";
// import DiagnosisPanel from "@/components/DiagnosisPanel";
// import {
//   Maximize2,
//   Thermometer,
//   Droplets,
//   Wind,
//   Sun,
//   AlertTriangle,
//   Leaf,
//   X,
//   FileText,
//   BarChart3,
//   Video,
//   Battery,
//   Zap,
// } from "lucide-react";

// export default function Home() {
//   const [selectedPlant, setSelectedPlant] = useState(null);
//   const [is3DActive, setIs3DActive] = useState(false);

//   // New States
//   const [currentView, setCurrentView] = useState("overview");
//   const [isReportOpen, setIsReportOpen] = useState(false);
//   const [powerTab, setPowerTab] = useState("energy");
//   const [weather, setWeather] = useState({ temp: "--", humid: "--" });

//   // Fetch Weather on Mount
//   useEffect(() => {
//     // Using Algiers coordinates (approximate)
//     const lat = 36.75;
//     const lon = 3.05;

//     fetch(
//       `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`,
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

//   // Fake Data for Power Charts
//   const powerData = {
//     energy: {
//       values: [35, 55, 25, 65, 45, 80, 50],
//       color: "bg-green-500",
//       label: "Solar Production",
//     },
//     storage: {
//       values: [90, 85, 80, 75, 60, 45, 30],
//       color: "bg-blue-500",
//       label: "Battery Level",
//     },
//   };

//   return (
//     <main className="h-screen w-full bg-[#F5F6F8] text-slate-900 flex flex-col font-sans overflow-hidden relative">
//       <Navbar setView={setCurrentView} currentView={currentView} />

//       <div className="flex-1 grid grid-cols-[320px_1fr_340px] gap-8 p-8 overflow-hidden min-w-[1280px] overflow-x-auto relative z-0">
//         {/* --- LEFT SIDEBAR --- */}
//         <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 no-scrollbar">
//           {/* Conditions Card */}
//           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
//             <div className="flex justify-between items-start mb-8">
//               <div>
//                 <h2 className="text-xl font-bold text-slate-900">
//                   Current Conditions
//                 </h2>
//                 <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
//                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />{" "}
//                   Live Feed
//                 </p>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-6">
//               <StatCard
//                 label="Air Temp"
//                 value={weather.temp}
//                 icon={Thermometer}
//                 color="text-red-500"
//               />
//               <StatCard
//                 label="Soil Moisture"
//                 value="45%"
//                 icon={Droplets}
//                 color="text-blue-500"
//               />
//               <StatCard
//                 label="Humidity"
//                 value={weather.humid}
//                 icon={Wind}
//                 color="text-sky-500"
//               />
//               <StatCard
//                 label="Light"
//                 value="1.2k lux"
//                 icon={Sun}
//                 color="text-yellow-500"
//               />
//             </div>

//             <button
//               onClick={() => setIsReportOpen(true)}
//               className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl text-base font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
//             >
//               <FileText className="w-5 h-5" /> View Detailed Report
//             </button>
//           </div>

//           {/* Consumption */}
//           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60">
//             <div className="flex justify-between mb-4">
//               <h3 className="text-lg font-bold text-slate-900">
//                 Net Consumption
//               </h3>
//               <Zap className="w-5 h-5 text-slate-400" />
//             </div>
//             <div className="flex items-baseline gap-2 mb-6">
//               <span className="text-4xl font-extrabold text-slate-900">
//                 56.46
//               </span>
//               <span className="text-lg font-medium text-slate-500">kW</span>
//             </div>
//             <div className="h-12 w-full bg-slate-100 rounded-2xl overflow-hidden flex shadow-inner relative">
//               <div className="h-full bg-green-500 w-1/2 flex items-center justify-center text-sm font-bold text-white z-10">
//                 50% Solar
//               </div>
//               <div className="h-full bg-green-100 w-1/2 flex items-center justify-center text-sm font-bold text-green-800 z-10">
//                 50% Grid
//               </div>
//             </div>
//           </div>

//           {/* Alerts */}
//           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 flex-1">
//             <div className="flex justify-between mb-6">
//               <h3 className="text-lg font-bold text-slate-900">Alerts (2)</h3>
//             </div>
//             <div className="space-y-4">
//               <AlertItem
//                 type="warning"
//                 text="Node 3 Temp High"
//                 onClick={() => setSelectedPlant("Node-3-Sensor")}
//               />
//               <AlertItem
//                 type="critical"
//                 text="Soil Sensor Offline"
//                 onClick={() => setSelectedPlant("Soil-Sensor-X")}
//               />
//             </div>
//           </div>
//         </div>

//         {/* --- MIDDLE SECTION (SWITCHES VIEWS) --- */}
//         <div className="relative rounded-[3rem] overflow-hidden bg-slate-100 shadow-2xl border border-slate-200/50 h-full group z-10">
//           {/* VIEW 1: OVERVIEW (3D Model) */}
//           {currentView === "overview" &&
//             (!is3DActive ? (
//               <div
//                 onClick={() => setIs3DActive(true)}
//                 className="w-full h-full relative cursor-pointer"
//               >
//                 <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-all z-10 flex items-center justify-center">
//                   <span className="bg-white/90 backdrop-blur-md px-8 py-4 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all font-bold text-slate-900 transform translate-y-4 group-hover:translate-y-0">
//                     Enter Interactive Mode
//                   </span>
//                 </div>
//                 <img
//                   src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2664&auto=format&fit=crop"
//                   alt="Greenhouse"
//                   className="w-full h-full object-cover"
//                 />
//                 <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent text-white">
//                   <h2 className="text-5xl font-extrabold mb-2">
//                     Greenhouse A1
//                   </h2>
//                   <p className="text-lg text-white/80 font-medium mb-8">
//                     Sector ID: GH-A1 • Automated Zone
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               <div className="w-full h-full bg-slate-900 relative">
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setIs3DActive(false);
//                   }}
//                   className="absolute top-6 right-6 z-50 bg-white/90 backdrop-blur-md text-slate-900 px-6 py-3 rounded-full shadow-lg text-sm font-bold hover:bg-white transition-all"
//                 >
//                   Exit 3D View
//                 </button>
//                 <DigitalTwin onPlantClick={setSelectedPlant} />
//               </div>
//             ))}

//           {/* VIEW 2: ANALYTICS */}
//           {currentView === "analytics" && (
//             <div className="w-full h-full bg-white p-12 flex flex-col items-center justify-center text-slate-300">
//               <BarChart3 className="w-32 h-32 mb-6 opacity-20" />
//               <h2 className="text-3xl font-bold text-slate-900 mb-2">
//                 Historical Analytics
//               </h2>
//               <p className="max-w-md text-center text-slate-500">
//                 Detailed charts for Temperature, Humidity, and Crop Yield trends
//                 over the last 30 days.
//               </p>
//               {/* You can implement Recharts here later */}
//             </div>
//           )}

//           {/* VIEW 3: MONITORING */}
//           {currentView === "monitoring" && (
//             <div className="w-full h-full bg-slate-900 p-8 grid grid-cols-2 gap-4">
//               {[1, 2, 3, 4].map((cam) => (
//                 <div
//                   key={cam}
//                   className="bg-black rounded-2xl border border-slate-700 relative overflow-hidden group"
//                 >
//                   <div className="absolute top-4 left-4 bg-red-600 text-white text-xs px-2 py-1 rounded-md font-bold flex items-center gap-1 animate-pulse">
//                     <div className="w-2 h-2 bg-white rounded-full" /> REC
//                   </div>
//                   <div className="absolute bottom-4 left-4 text-white font-mono text-sm">
//                     CAM-0{cam} Feed
//                   </div>
//                   <div className="w-full h-full flex items-center justify-center text-slate-700">
//                     <Video className="w-12 h-12" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* --- RIGHT SIDEBAR --- */}
//         <div className="flex flex-col gap-6 h-full overflow-y-auto pl-2 no-scrollbar">
//           {/* Growth Metrics */}
//           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60">
//             <div className="flex justify-center">
//               <h3 className="text-lg font-bold text-slate-900 ">
//                 Growth Metrics
//               </h3>
//             </div>
//             <div className="flex gap-6">
//               <GaugeCard
//                 value={42}
//                 label="CO2"
//                 sub="420 ppm"
//                 color="text-green-500"
//               />
//               <GaugeCard
//                 value={56}
//                 label="pH"
//                 sub="6.8"
//                 color="text-slate-300"
//               />
//             </div>
//           </div>

//           {/* Site Power (TOGGLEABLE) */}
//           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 flex-1">
//             <div className="flex flex-col mb-8">
//               <h3 className="text-lg font-bold text-slate-900 text-center">
//                 Site Power
//               </h3>
//               <div className="flex bg-slate-100 p-1.5 rounded-xl">
//                 <button
//                   onClick={() => setPowerTab("storage")}
//                   className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${powerTab === "storage" ? "bg-white shadow-md text-blue-600" : "text-slate-500 hover:text-slate-900"}`}
//                 >
//                   <Battery className="w-4 h-4" /> Storage
//                 </button>
//                 <button
//                   onClick={() => setPowerTab("energy")}
//                   className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${powerTab === "energy" ? "bg-white shadow-md text-green-600" : "text-slate-500 hover:text-slate-900"}`}
//                 >
//                   <Zap className="w-4 h-4" /> Energy
//                 </button>
//               </div>
//             </div>

//             <div className="flex justify-between items-end h-64 gap-3">
//               {powerData[powerTab].values.map((h, i) => (
//                 <div
//                   key={i}
//                   className="w-full bg-slate-100 rounded-t-2xl relative group h-full overflow-hidden"
//                 >
//                   <div
//                     className={`absolute bottom-0 w-full transition-all duration-700 ${powerData[powerTab].color} opacity-80 group-hover:opacity-100`}
//                     style={{ height: `${h}%` }}
//                   />
//                   {/* Tooltip on hover */}
//                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
//                     {h}%
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
//               <span>00:00</span>
//               <span>12:00</span>
//               <span>23:59</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Diagnosis Panel */}
//       <DiagnosisPanel
//         isOpen={!!selectedPlant}
//         plantId={selectedPlant}
//         onClose={() => setSelectedPlant(null)}
//       />

//       {/* REPORT MODAL */}
//       {isReportOpen && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
//           <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold text-slate-900">
//                 Daily Agronomy Report
//               </h2>
//               <button
//                 onClick={() => setIsReportOpen(false)}
//                 className="p-2 hover:bg-slate-100 rounded-full"
//               >
//                 <X className="w-5 h-5 text-slate-500" />
//               </button>
//             </div>

//             <div className="space-y-6">
//               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-between items-center">
//                 <span className="text-slate-500 font-medium">
//                   Overall System Health
//                 </span>
//                 <span className="text-4xl font-black text-green-500">92%</span>
//               </div>

//               <div className="space-y-4">
//                 <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
//                   Critical Incidents (24h)
//                 </h3>
//                 <div className="flex items-center gap-4 text-sm text-slate-600 border-b border-slate-100 pb-3">
//                   <span className="w-16 font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
//                     10:42
//                   </span>
//                   <span className="flex-1 font-medium">
//                     Humidity dropped below 40%
//                   </span>
//                   <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded text-xs font-bold">
//                     RESOLVED
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-4 text-sm text-slate-600 border-b border-slate-100 pb-3">
//                   <span className="w-16 font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
//                     14:15
//                   </span>
//                   <span className="flex-1 font-medium">
//                     Irrigation pump pressure loss
//                   </span>
//                   <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">
//                     AUTO-FIXED
//                   </span>
//                 </div>
//               </div>

//               <div className="flex gap-3 pt-2">
//                 <button
//                   onClick={() => setIsReportOpen(false)}
//                   className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50"
//                 >
//                   Close
//                 </button>
//                 <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg flex items-center justify-center gap-2">
//                   <FileText className="w-4 h-4" /> Export PDF
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }

// // --- SUB COMPONENTS ---

// function StatCard({ label, value, icon: Icon, color }) {
//   return (
//     <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors group">
//       <div className="flex justify-between items-start mb-3">
//         <p className="text-sm text-slate-500 font-bold">{label}</p>
//         <div className={`p-2 rounded-lg bg-white shadow-sm ${color}`}>
//           <Icon className="w-4 h-4" />
//         </div>
//       </div>
//       <div className="text-2xl font-extrabold text-slate-900 group-hover:scale-105 transition-transform origin-left">
//         {value}
//       </div>
//     </div>
//   );
// }

// function AlertItem({ type, text, onClick }) {
//   const isCrit = type === "critical";
//   return (
//     <div
//       onClick={onClick}
//       className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer active:scale-95 group ${
//         isCrit
//           ? "bg-red-50/50 border-red-100 hover:bg-red-50 hover:border-red-200"
//           : "bg-orange-50/50 border-orange-100 hover:bg-orange-50 hover:border-orange-200"
//       }`}
//     >
//       <div
//         className={`p-3 rounded-full shadow-sm ${
//           isCrit ? "bg-white text-red-600" : "bg-white text-orange-600"
//         }`}
//       >
//         <AlertTriangle className="w-5 h-5 group-hover:scale-110 transition-transform" />
//       </div>
//       <div>
//         <p
//           className={`text-base font-bold ${isCrit ? "text-red-700" : "text-orange-700"}`}
//         >
//           {text}
//         </p>
//         <p className="text-xs font-bold uppercase tracking-wide opacity-60 mt-1">
//           Click to diagnose
//         </p>
//       </div>
//     </div>
//   );
// }

// function GaugeCard({ value, label, sub, color }) {
//   return (
//     <div className="flex-1 bg-slate-50/80 rounded-2xl p-6 flex flex-col items-center border border-slate-100 shadow-sm hover:shadow-md transition-all group">
//       <div className="relative w-24 h-12 overflow-hidden mb-4 group-hover:scale-105 transition-transform">
//         <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-[8px] border-slate-200"></div>
//         <div
//           className={`absolute top-0 left-0 w-24 h-24 rounded-full border-[8px] border-current ${color}`}
//           style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }}
//         ></div>
//       </div>
//       <span className="text-4xl font-extrabold text-slate-900">{value}</span>
//       <span className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
//         {label}
//       </span>
//       <span className="text-xs text-slate-400 font-medium mt-1">{sub}</span>
//     </div>
//   );
// }
"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import DigitalTwin from "@/components/DigitalTwin";
import DiagnosisPanel from "@/components/DiagnosisPanel";
import {
  Maximize2,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  AlertTriangle,
  Leaf,
  X,
  FileText,
  BarChart3,
  Video,
  Battery,
  Zap,
} from "lucide-react";

export default function Home() {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [is3DActive, setIs3DActive] = useState(false);

  // States for Navigation and Modals
  const [currentView, setCurrentView] = useState("overview");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [powerTab, setPowerTab] = useState("energy");
  const [weather, setWeather] = useState({ temp: "--", humid: "--" });

  useEffect(() => {
    const lat = 36.75;
    const lon = 3.05;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`,
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

  const powerData = {
    energy: { values: [35, 55, 25, 65, 45, 80, 50], color: "bg-green-500" },
    storage: { values: [90, 85, 80, 75, 60, 45, 30], color: "bg-blue-500" },
  };

  return (
    <main className="h-screen w-full bg-[#F5F6F8] text-slate-900 flex flex-col font-sans overflow-hidden relative">
      <Navbar setView={setCurrentView} currentView={currentView} />

      <div className="flex-1 grid grid-cols-[300px_1fr_320px] gap-6 p-6 overflow-hidden min-w-[1280px] overflow-x-auto relative z-0">
        {/* --- LEFT SIDEBAR --- */}
        <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1 no-scrollbar">
          {/* Conditions Card */}
          <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  Current Conditions
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />{" "}
                  Live Feed
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Air Temp"
                value={weather.temp}
                icon={Thermometer}
                color="text-red-500"
              />
              <StatCard
                label="Soil"
                value="45%"
                icon={Droplets}
                color="text-blue-500"
              />
              <StatCard
                label="Humid"
                value={weather.humid}
                icon={Wind}
                color="text-sky-500"
              />
              <StatCard
                label="Light"
                value="1.2k"
                icon={Sun}
                color="text-yellow-500"
              />
            </div>

            <button
              onClick={() => setIsReportOpen(true)}
              className="w-full mt-5 bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" /> Daily Report
            </button>
          </div>

          {/* Consumption Card */}
          <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-200/60">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Load
              </h3>
              <Zap className="w-4 h-4 text-slate-300" />
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-black text-slate-900">56.4</span>
              <span className="text-sm font-bold text-slate-400">kW</span>
            </div>
            <div className="h-8 w-full bg-slate-100 rounded-lg overflow-hidden flex shadow-inner relative text-[10px] font-bold">
              <div className="h-full bg-green-500 w-1/2 flex items-center justify-center text-white z-10">
                Solar
              </div>
              <div className="h-full bg-green-100 w-1/2 flex items-center justify-center text-green-800 z-10">
                Grid
              </div>
            </div>
          </div>

          {/* Alerts Card */}
          <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-200/60 flex-1">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Alerts (2)
            </h3>
            <div className="space-y-3">
              <AlertItem
                type="warning"
                text="Node 3 Temp"
                onClick={() => setSelectedPlant("Node-3")}
              />
              <AlertItem
                type="critical"
                text="Soil Offline"
                onClick={() => setSelectedPlant("Soil-X")}
              />
            </div>
          </div>
        </div>

        {/* --- MIDDLE SECTION (RESTORED VIEWS) --- */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-2xl border border-slate-200/50 h-full z-10">
          {/* VIEW 1: OVERVIEW */}
          {currentView === "overview" &&
            (!is3DActive ? (
              <div
                onClick={() => setIs3DActive(true)}
                className="w-full h-full relative cursor-pointer group"
              >
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-all z-10 flex items-center justify-center">
                  <span className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all font-bold text-slate-900">
                    Open 3D View
                  </span>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2664&auto=format&fit=crop"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-slate-900/80 to-transparent text-white">
                  <h2 className="text-4xl font-black">Greenhouse A1</h2>
                  <p className="text-sm text-white/70 font-bold uppercase tracking-widest mt-1">
                    Sector ID: GH-A1
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-slate-900 relative">
                <button
                  onClick={() => setIs3DActive(false)}
                  className="absolute top-6 right-6 z-50 bg-white text-slate-900 px-5 py-2.5 rounded-full shadow-lg text-xs font-bold transition-all hover:scale-105"
                >
                  Exit 3D View
                </button>
                <DigitalTwin onPlantClick={setSelectedPlant} />
              </div>
            ))}

          {/* VIEW 2: ANALYTICS (RESTORED) */}
          {currentView === "analytics" && (
            <div className="w-full h-full bg-white p-12 flex flex-col items-center justify-center">
              <BarChart3 className="w-20 h-20 mb-4 text-slate-200" />
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                Historical Analytics
              </h2>
              <p className="text-slate-500 text-center max-w-sm font-medium">
                Detailed performance charts and yield forecasting will be
                displayed here.
              </p>
            </div>
          )}

          {/* VIEW 3: MONITORING (RESTORED) */}
          {currentView === "monitoring" && (
            <div className="w-full h-full bg-slate-900 p-6 grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((cam) => (
                <div
                  key={cam}
                  className="bg-black rounded-2xl border border-slate-800 relative overflow-hidden"
                >
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] px-2 py-1 rounded font-black flex items-center gap-1 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
                  </div>
                  <div className="w-full h-full flex items-center justify-center text-slate-800">
                    <Video className="w-10 h-10" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- RIGHT SIDEBAR --- */}
        <div className="flex flex-col gap-5 h-full overflow-y-auto pl-1 no-scrollbar">
          <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-200/60">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center mb-4">
              Growth Metrics
            </h3>
            <div className="flex gap-4">
              <GaugeCard
                value={42}
                label="CO2"
                sub="ppm"
                color="text-green-500"
              />
              <GaugeCard
                value={5.6}
                label="pH"
                sub="lv"
                color="text-slate-300"
              />
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-200/60 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 text-center mb-3">
              Site Power
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
              <button
                onClick={() => setPowerTab("storage")}
                className={`flex-1 py-1.5 text-[10px] font-black rounded-md transition-all ${powerTab === "storage" ? "bg-white shadow text-blue-600" : "text-slate-400"}`}
              >
                STORAGE
              </button>
              <button
                onClick={() => setPowerTab("energy")}
                className={`flex-1 py-1.5 text-[10px] font-black rounded-md transition-all ${powerTab === "energy" ? "bg-white shadow text-green-600" : "text-slate-400"}`}
              >
                ENERGY
              </button>
            </div>

            <div className="flex-1 flex justify-between items-end gap-2 px-1">
              {powerData[powerTab].values.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-slate-100 rounded-t-lg relative group h-full overflow-hidden"
                >
                  <div
                    className={`absolute bottom-0 w-full transition-all duration-700 ${powerData[powerTab].color} opacity-80 group-hover:opacity-100`}
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-[9px] font-bold text-slate-300 font-mono">
              <span>00:00</span>
              <span>23:59</span>
            </div>
          </div>
        </div>
      </div>

      <DiagnosisPanel
        isOpen={!!selectedPlant}
        plantId={selectedPlant}
        onClose={() => setSelectedPlant(null)}
      />

      {/* REPORT MODAL (FIXED AND RESTORED) */}
      {isReportOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Daily Agronomy Report
              </h2>
              <button
                onClick={() => setIsReportOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex justify-between items-center">
                <span className="text-slate-500 font-bold text-sm">
                  System Health
                </span>
                <span className="text-3xl font-black text-green-500">92%</span>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">
                  Incident Log
                </h3>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-600 border-b border-slate-50 pb-2">
                  <span className="text-slate-300 font-mono">10:42</span>
                  <span className="flex-1">Humidity Low Threshold</span>
                  <span className="text-orange-500">Fixed</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-600 border-b border-slate-50 pb-2">
                  <span className="text-slate-300 font-mono">14:15</span>
                  <span className="flex-1">Pump A1 Pressure Drop</span>
                  <span className="text-green-500">Auto</span>
                </div>
              </div>
              <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg">
                Download PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Sub-components (StatCard, AlertItem, GaugeCard) stay exactly as the previous minimized versions.
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 transition-all hover:bg-white group">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
          {label}
        </p>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <div className="text-xl font-black text-slate-900 tracking-tighter">
        {value}
      </div>
    </div>
  );
}

function AlertItem({ type, text, onClick }) {
  const isCrit = type === "critical";
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isCrit ? "bg-red-50 border-red-100" : "bg-orange-50 border-orange-100"}`}
    >
      <AlertTriangle
        className={`w-4 h-4 ${isCrit ? "text-red-500" : "text-orange-500"}`}
      />
      <p className="text-xs font-bold text-slate-700 truncate">{text}</p>
    </div>
  );
}

function GaugeCard({ value, label, sub, color }) {
  return (
    <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center">
      <div className="relative w-16 h-8 overflow-hidden mb-2">
        <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-[6px] border-slate-200"></div>
        <div
          className={`absolute top-0 left-0 w-16 h-16 rounded-full border-[6px] border-current ${color}`}
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }}
        ></div>
      </div>
      <span className="text-xl font-black text-slate-900">{value}</span>
      <span className="text-[9px] text-slate-400 font-bold uppercase">
        {label} <span className="lowercase font-normal">{sub}</span>
      </span>
    </div>
  );
}