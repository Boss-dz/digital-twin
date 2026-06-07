// import { Leaf, Droplets, Zap, TrendingUp, ShieldAlert } from "lucide-react";
// import { useState, useEffect } from "react";
// import {
//   ComposedChart,
//   Line,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RechartsTooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   AreaChart,
//   Area,
// } from "recharts";

// const BACKEND_URL = "http://localhost:8000";

// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50">
//         <p className="font-black text-slate-900 mb-2">{label}</p>
//         {payload.map((entry, index) => (
//           <p
//             key={index}
//             className="text-sm font-bold flex items-center gap-2"
//             style={{ color: entry.color }}
//           >
//             <span
//               className="w-2 h-2 rounded-full"
//               style={{ backgroundColor: entry.color }}
//             ></span>
//             {entry.name}: {entry.value}
//           </p>
//         ))}
//       </div>
//     );
//   }
//   return null;
// };

// export default function AnalyticsDashboard({
//   sickPlants = [],
//   totalPlants = 72,
// }) {
//   // THE FIX: Fetch Live Data from MongoDB via Python API
//   const [dbData, setDbData] = useState([]);
//   useEffect(() => {
//     const fetchAnalytics = async () => {
//       try {
//         const response = await fetch(`${BACKEND_URL}/analytics/data`);
//         const data = await response.json();
//         setDbData(data);
//       } catch (error) {
//         console.error("Failed to fetch MongoDB Analytics:", error);
//       }
//     };

//     fetchAnalytics();
//     // Refresh every 60 seconds to match the IoT background task
//     const interval = setInterval(fetchAnalytics, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   const healthyCount = totalPlants - sickPlants.length;
//   let scabCount = 0,
//     rustCount = 0,
//     complexCount = 0,
//     frogEyeCount = 0;

//   sickPlants.forEach((plant) => {
//     const file = plant.file.toLowerCase();
//     if (file.includes("scab") || file.includes("sc.")) scabCount++;
//     else if (file.includes("rust")) rustCount++;
//     else if (file.includes("complex")) complexCount++;
//     else frogEyeCount++;
//   });

//   const pathogenData = [
//     { name: "Healthy", value: healthyCount, color: "#22c55e" },
//   ];
//   if (scabCount > 0)
//     pathogenData.push({
//       name: "Apple Scab",
//       value: scabCount,
//       color: "#ef4444",
//     });
//   if (rustCount > 0)
//     pathogenData.push({
//       name: "Cedar Rust",
//       value: rustCount,
//       color: "#f97316",
//     });
//   if (frogEyeCount > 0)
//     pathogenData.push({
//       name: "Frog-eye Spot",
//       value: frogEyeCount,
//       color: "#eab308",
//     });
//   if (complexCount > 0)
//     pathogenData.push({
//       name: "Complex/Other",
//       value: complexCount,
//       color: "#8b5cf6",
//     });

//   // Get the latest values for the Sparklines (fallback to 0 if db is empty)
//   const latestData =
//     dbData.length > 0
//       ? dbData[dbData.length - 1]
//       : { co2: "--", ph: "--", power: "--" };

//   return (
//     <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-10">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-black text-slate-900 tracking-tight">
//             Predictive Analytics
//           </h2>
//           <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">
//             AI Pathogen Detection & IoT Telemetry Correlation
//           </p>
//         </div>
//         <div className="flex gap-2 bg-white/60 p-1.5 rounded-2xl backdrop-blur-xl border border-white shadow-sm w-fit">
//           <button className="px-5 py-2 bg-white rounded-xl shadow-sm text-sm font-black text-green-600">
//             LIVE
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[450px]">
//         {/* Cause & Effect Chart using REAL MongoDB Data */}
//         <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-xl shadow-slate-200/30 flex flex-col h-full relative overflow-hidden group">
//           <div className="flex justify-between items-start mb-6">
//             <div>
//               <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
//                 <TrendingUp className="w-5 h-5 text-blue-500" /> Disease
//                 Progression vs Environment
//               </h3>
//               <p className="text-xs font-bold text-slate-500 mt-1">
//                 Comparing real-time humidity against new AI pathogen detections
//               </p>
//             </div>
//           </div>

//           <div className="flex-1 w-full min-h-[250px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <ComposedChart
//                 data={dbData}
//                 margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
//               >
//                 <CartesianGrid
//                   strokeDasharray="3 3"
//                   vertical={false}
//                   stroke="#e2e8f0"
//                 />
//                 <XAxis
//                   dataKey="time"
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
//                   dy={10}
//                 />
//                 <YAxis
//                   yAxisId="left"
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
//                 />
//                 <YAxis
//                   yAxisId="right"
//                   orientation="right"
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
//                   domain={[0, "dataMax + 2"]}
//                 />
//                 <RechartsTooltip content={<CustomTooltip />} />
//                 <Bar
//                   yAxisId="right"
//                   dataKey="newInfections"
//                   name="New Infections"
//                   fill="#ef4444"
//                   radius={[4, 4, 0, 0]}
//                   barSize={30}
//                 />
//                 <Line
//                   yAxisId="left"
//                   type="monotone"
//                   dataKey="humidity"
//                   name="Humidity (%)"
//                   stroke="#3b82f6"
//                   strokeWidth={4}
//                   dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
//                   activeDot={{ r: 6 }}
//                 />
//               </ComposedChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-xl shadow-slate-200/30 flex flex-col h-full">
//           <div className="flex justify-between items-start mb-2">
//             <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
//               <ShieldAlert className="w-5 h-5 text-red-500" /> AI Diagnostic
//               Profile
//             </h3>
//             {sickPlants.length > 0 && (
//               <span className="relative flex h-3 w-3">
//                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
//                 <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
//               </span>
//             )}
//           </div>
//           <p className="text-xs font-bold text-slate-500 mb-6">
//             Real-time breakdown of all {totalPlants} monitored nodes.
//           </p>

//           <div className="flex-1 w-full relative min-h-[200px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={pathogenData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={60}
//                   outerRadius={80}
//                   paddingAngle={5}
//                   dataKey="value"
//                   stroke="none"
//                 >
//                   {pathogenData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <RechartsTooltip content={<CustomTooltip />} />
//               </PieChart>
//             </ResponsiveContainer>
//             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
//               <span
//                 className={`text-3xl font-black leading-none ${sickPlants.length === 0 ? "text-green-500" : "text-slate-900"}`}
//               >
//                 {sickPlants.length === 0 ? "100%" : sickPlants.length}
//               </span>
//               <span
//                 className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${sickPlants.length === 0 ? "text-green-600" : "text-slate-400"}`}
//               >
//                 {sickPlants.length === 0 ? "Healthy" : "Infected"}
//               </span>
//             </div>
//           </div>

//           <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4">
//             {pathogenData.map((item, i) => (
//               <div key={i} className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div
//                     className="w-2.5 h-2.5 rounded-full"
//                     style={{ backgroundColor: item.color }}
//                   />
//                   <span className="text-xs font-bold text-slate-600 truncate max-w-[80px]">
//                     {item.name}
//                   </span>
//                 </div>
//                 <span className="text-xs font-black text-slate-900">
//                   {item.value}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-lg shadow-slate-200/30 relative overflow-hidden group">
//           <div className="flex justify-between items-start mb-4 relative z-10">
//             <div>
//               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
//                 CO2 Dispersion
//               </h4>
//               <div className="flex items-baseline gap-1">
//                 <span className="text-3xl font-black text-slate-900">
//                   {latestData.co2}
//                 </span>
//                 <span className="text-xs font-bold text-slate-400">ppm</span>
//               </div>
//             </div>
//             <div className="bg-green-100 p-3 rounded-2xl text-green-600">
//               <Leaf className="w-5 h-5" />
//             </div>
//           </div>
//           <div className="h-20 w-full absolute bottom-0 left-0 opacity-50 group-hover:opacity-100 transition-opacity">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={dbData}>
//                 <defs>
//                   <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
//                     <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <Area
//                   type="monotone"
//                   dataKey="co2"
//                   stroke="#22c55e"
//                   strokeWidth={3}
//                   fillOpacity={1}
//                   fill="url(#colorCo2)"
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-lg shadow-slate-200/30 relative overflow-hidden group">
//           <div className="flex justify-between items-start mb-4 relative z-10">
//             <div>
//               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
//                 Soil pH Balance
//               </h4>
//               <div className="flex items-baseline gap-1">
//                 <span className="text-3xl font-black text-slate-900">
//                   {latestData.ph}
//                 </span>
//                 <span className="text-xs font-bold text-slate-400">lvl</span>
//               </div>
//             </div>
//             <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
//               <Droplets className="w-5 h-5" />
//             </div>
//           </div>
//           <div className="h-20 w-full absolute bottom-0 left-0 opacity-50 group-hover:opacity-100 transition-opacity">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={dbData}>
//                 <defs>
//                   <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
//                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <Area
//                   type="monotone"
//                   dataKey="ph"
//                   stroke="#3b82f6"
//                   strokeWidth={3}
//                   fillOpacity={1}
//                   fill="url(#colorPh)"
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-lg shadow-slate-200/30 relative overflow-hidden group">
//           <div className="flex justify-between items-start mb-4 relative z-10">
//             <div>
//               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
//                 Power Draw
//               </h4>
//               <div className="flex items-baseline gap-1">
//                 <span className="text-3xl font-black text-slate-900">
//                   {latestData.power}
//                 </span>
//                 <span className="text-xs font-bold text-slate-400">kW</span>
//               </div>
//             </div>
//             <div className="bg-yellow-100 p-3 rounded-2xl text-yellow-600">
//               <Zap className="w-5 h-5" />
//             </div>
//           </div>
//           <div className="h-20 w-full absolute bottom-0 left-0 opacity-50 group-hover:opacity-100 transition-opacity">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={dbData}>
//                 <defs>
//                   <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
//                     <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <Area
//                   type="monotone"
//                   dataKey="power"
//                   stroke="#eab308"
//                   strokeWidth={3}
//                   fillOpacity={1}
//                   fill="url(#colorPower)"
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { Leaf, Droplets, Zap, TrendingUp, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const BACKEND_URL = "http://localhost:8000";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50">
        <p className="font-black text-slate-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm font-bold flex items-center gap-2"
            style={{ color: entry.color || entry.payload.fill }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.payload.fill }}
            ></span>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard({
  sickPlants = [],
  totalPlants = 72,
}) {
  const [dbData, setDbData] = useState([]);
  const [distributionData, setDistributionData] = useState([]); // 🟢 Nouvel état pour le Donut Chart

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/analytics/data`);
        const data = await response.json();
        setDbData(data);
      } catch (error) {
        console.error("Failed to fetch MongoDB Analytics:", error);
      }
    };

    // 🟢 Nouveau Fetch pour la distribution Multi-labels
    const fetchDistribution = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/analytics/distribution`);
        const data = await response.json();

        if (data && data.length > 0) {
          setDistributionData(data);
        } else {
          // Fallback visuel si la base est vide ou si tout est sain
          setDistributionData([
            { name: "Healthy", value: totalPlants, fill: "#22c55e" },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch Disease Distribution:", error);
      }
    };

    fetchAnalytics();
    fetchDistribution();

    // Refresh every 60 seconds to match the IoT background task
    const interval = setInterval(() => {
      fetchAnalytics();
      fetchDistribution();
    }, 60000);

    return () => clearInterval(interval);
  }, [totalPlants]);

  // Get the latest values for the Sparklines (fallback to 0 if db is empty)
  const latestData =
    dbData.length > 0
      ? dbData[dbData.length - 1]
      : { co2: "--", ph: "--", power: "--" };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Predictive Analytics
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">
            AI Pathogen Detection & IoT Telemetry Correlation
          </p>
        </div>
        <div className="flex gap-2 bg-white/60 p-1.5 rounded-2xl backdrop-blur-xl border border-white shadow-sm w-fit">
          <button className="px-5 py-2 bg-white rounded-xl shadow-sm text-sm font-black text-green-600">
            LIVE
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[450px]">
        {/* Cause & Effect Chart using REAL MongoDB Data */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-xl shadow-slate-200/30 flex flex-col h-full relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" /> Disease
                Progression vs Environment
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-1">
                Comparing real-time humidity against new AI pathogen detections
              </p>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={dbData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                  domain={[0, "dataMax + 2"]}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar
                  yAxisId="right"
                  dataKey="newInfections"
                  name="New Infections"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity (%)"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Diagnostic Profile - REAL MongoDB Multi-label Distribution */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-xl shadow-slate-200/30 flex flex-col h-full">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" /> AI Diagnostic
              Profile
            </h3>
            {sickPlants.length > 0 && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-500 mb-6">
            Real-time multi-label breakdown of {totalPlants} monitored nodes.
          </p>

          <div className="flex-1 w-full relative min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span
                className={`text-3xl font-black leading-none ${sickPlants.length === 0 ? "text-green-500" : "text-slate-900"}`}
              >
                {sickPlants.length === 0 ? "100%" : sickPlants.length}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${sickPlants.length === 0 ? "text-green-600" : "text-slate-400"}`}
              >
                {sickPlants.length === 0 ? "Healthy" : "Nodes Infected"}
              </span>
            </div> */}
            {(() => {
              const isHealthy =
                distributionData.length === 1 &&
                distributionData[0].name === "Healthy";
              const totalDetections = isHealthy
                ? 0
                : distributionData.reduce((sum, item) => sum + item.value, 0);

              return (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span
                    className={`text-3xl font-black leading-none ${totalDetections === 0 ? "text-green-500" : "text-slate-900"}`}
                  >
                    {totalDetections === 0 ? "100%" : totalDetections}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${totalDetections === 0 ? "text-green-600" : "text-slate-400"}`}
                  >
                    {totalDetections === 0 ? "Healthy" : "Pathogen Signatures"}
                  </span>
                </div>
              );
            })()}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4">
            {distributionData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span
                    className="text-xs font-bold text-slate-600 truncate max-w-[80px]"
                    title={item.name}
                  >
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-black text-slate-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CO2 Dispersion */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-lg shadow-slate-200/30 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                CO2 Dispersion
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">
                  {latestData.co2}
                </span>
                <span className="text-xs font-bold text-slate-400">ppm</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-2xl text-green-600">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div className="h-20 w-full absolute bottom-0 left-0 opacity-50 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dbData}>
                <defs>
                  <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="co2"
                  stroke="#22c55e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCo2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Soil pH Balance */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-lg shadow-slate-200/30 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Soil pH Balance
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">
                  {latestData.ph}
                </span>
                <span className="text-xs font-bold text-slate-400">lvl</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="h-20 w-full absolute bottom-0 left-0 opacity-50 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dbData}>
                <defs>
                  <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="ph"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPh)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Power Draw */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-lg shadow-slate-200/30 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Power Draw
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">
                  {latestData.power}
                </span>
                <span className="text-xs font-bold text-slate-400">kW</span>
              </div>
            </div>
            <div className="bg-yellow-100 p-3 rounded-2xl text-yellow-600">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="h-20 w-full absolute bottom-0 left-0 opacity-50 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dbData}>
                <defs>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="power"
                  stroke="#eab308"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPower)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}