// "use client";
// import { useState } from "react";
// import { Bell, ChevronDown, User } from "lucide-react";

// export default function Navbar({ setView, currentView, alerts = [] }) {
//   const [showNotifs, setShowNotifs] = useState(false);

//   return (
//     <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-50">
//       <div className="flex items-center gap-10">
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-lg">
//             <div className="w-3 h-3 bg-white rounded-full" />
//           </div>
//           <span className="font-bold text-lg tracking-tight text-slate-900">
//             DigTwin
//           </span>
//         </div>
//         <nav className="flex items-center gap-8 text-sm font-medium">
//           {["overview", "analytics", "monitoring"].map((view) => (
//             <button
//               key={view}
//               onClick={() => setView(view)}
//               className={`capitalize transition-colors relative ${currentView === view ? "text-slate-900 font-bold" : "text-slate-500 hover:text-slate-900"}`}
//             >
//               {view}
//               {currentView === view && (
//                 <span className="absolute -bottom-[22px] left-0 w-full h-[2px] bg-black rounded-full" />
//               )}
//             </button>
//           ))}
//         </nav>
//       </div>

//       <div className="flex items-center gap-6">
//         <div className="relative">
//           <button
//             onClick={() => setShowNotifs(!showNotifs)}
//             className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
//           >
//             <Bell className="w-5 h-5 text-slate-500 hover:text-slate-900" />
//             {/* Only pulse red if there is actually an alert! */}
//             {alerts.length > 0 && (
//               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white" />
//             )}
//           </button>

//           {showNotifs && (
//             <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 z-50 animate-in slide-in-from-top-2">
//               <div className="flex justify-between items-center mb-3">
//                 <h4 className="font-bold text-slate-900 text-sm">
//                   Notifications
//                 </h4>
//                 <button
//                   onClick={() => setShowNotifs(false)}
//                   className="text-xs text-blue-600 hover:underline"
//                 >
//                   Mark all read
//                 </button>
//               </div>

//               <div className="space-y-3">
//                 {alerts.length === 0 ? (
//                   <p className="text-xs text-slate-500 text-center py-2">
//                     No new alerts. Automated scout is monitoring.
//                   </p>
//                 ) : (
//                   alerts.map((alert, i) => (
//                     <div
//                       key={i}
//                       className="flex gap-3 items-start border-b border-slate-50 pb-2"
//                     >
//                       <div className="w-2 h-2 mt-2 bg-red-500 rounded-full shrink-0" />
//                       <div>
//                         <p className="text-sm font-bold text-slate-800">
//                           {alert.title}
//                         </p>
//                         <p className="text-xs text-slate-500">
//                           {alert.time} • Node: {alert.node}
//                         </p>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
//           <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
//             <User className="w-5 h-5" />
//           </div>
//           <div className="flex flex-col leading-tight">
//             <span className="text-sm font-bold text-slate-900">Admin User</span>
//             <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
//               Agronomist
//             </span>
//           </div>
//           <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" />
//         </div>
//       </div>
//     </header>
//   );
// }
"use client";
import { useState } from "react";
import {
  Bell,
  ChevronDown,
  User,
  LayoutDashboard,
  Box,
  LineChart,
  CheckCircle,
  Sprout,
} from "lucide-react";

export default function Navbar({ setView, currentView, alerts = [] }) {
  const [showNotifs, setShowNotifs] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: LayoutDashboard },
    { id: "3dmodel", label: "3D Digital Twin", icon: Box },
    { id: "analytics", label: "Analytics", icon: LineChart },
  ];

  return (
    <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-white/50 px-8 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-12">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/30">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tight text-slate-900 drop-shadow-sm">
            DigTwin.
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-white">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                currentView === item.id
                  ? "bg-white text-green-700 shadow-md scale-100"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/50 scale-95 hover:scale-100"
              }`}
            >
              <item.icon
                className={`w-4 h-4 ${currentView === item.id ? "text-green-600" : ""}`}
              />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-3 bg-white hover:bg-slate-50 rounded-full transition-colors shadow-sm border border-slate-100"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {alerts.length > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
            {alerts.length > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>

          {/* Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 top-14 w-80 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white p-4 z-50 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-black text-slate-900 text-sm">
                  IoT Alerts
                </h4>
                <button
                  onClick={() => setShowNotifs(false)}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-wider"
                >
                  Dismiss All
                </button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-bold">No active alerts.</p>
                  </div>
                ) : (
                  alerts.map((alert, i) => (
                    <div
                      key={i}
                      className="bg-red-50/50 p-3 rounded-xl border border-red-100/50 flex gap-3 items-start"
                    >
                      <div className="w-2 h-2 mt-1.5 bg-red-500 rounded-full shrink-0 animate-pulse" />
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">
                          {alert.title}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                          {alert.time} • {alert.node}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer group bg-white pl-2 pr-4 py-2 rounded-full shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-black text-slate-900">Admin</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Agronomist
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition ml-2" />
        </div>
      </div>
    </header>
  );
}