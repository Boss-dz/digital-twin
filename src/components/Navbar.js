// "use client";
// import { useState } from "react";
// import { Bell, ChevronDown, User } from "lucide-react";

// export default function Navbar({ setView, currentView }) {
//   const [showNotifs, setShowNotifs] = useState(false);

//   return (
//     <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-50">
//       {/* LEFT SIDE */}
//       <div className="flex items-center gap-10">
//         {/* Logo */}
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-lg">
//             <div className="w-3 h-3 bg-white rounded-full" />
//           </div>
//           <span className="font-bold text-lg tracking-tight text-slate-900">
//             DigTwin
//           </span>
//         </div>

//         {/* Navigation */}
//         <nav className="flex items-center gap-8 text-sm font-medium">
//           {["overview", "analytics", "monitoring"].map((view) => (
//             <button
//               key={view}
//               onClick={() => setView(view)}
//               className={`capitalize transition-colors relative ${
//                 currentView === view
//                   ? "text-slate-900 font-bold"
//                   : "text-slate-500 hover:text-slate-900"
//               }`}
//             >
//               {view}
//               {currentView === view && (
//                 <span className="absolute -bottom-[22px] left-0 w-full h-[2px] bg-black rounded-full" />
//               )}
//             </button>
//           ))}
//         </nav>
//       </div>

//       {/* RIGHT SIDE */}
//       <div className="flex items-center gap-6">
//         {/* Notification Bell */}
//         <div className="relative">
//           <button
//             onClick={() => setShowNotifs(!showNotifs)}
//             className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
//           >
//             <Bell className="w-5 h-5 text-slate-500 hover:text-slate-900" />
//             <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white" />
//           </button>

//           {/* Notification Dropdown */}
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
//                 <div className="flex gap-3 items-start border-b border-slate-50 pb-2">
//                   <div className="w-2 h-2 mt-2 bg-red-500 rounded-full shrink-0" />
//                   <div>
//                     <p className="text-sm font-bold text-slate-800">
//                       Critical: Pump Failure
//                     </p>
//                     <p className="text-xs text-slate-500">
//                       2 mins ago • Sector A1
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex gap-3 items-start">
//                   <div className="w-2 h-2 mt-2 bg-orange-500 rounded-full shrink-0" />
//                   <div>
//                     <p className="text-sm font-bold text-slate-800">
//                       Warning: High Temp
//                     </p>
//                     <p className="text-xs text-slate-500">
//                       10 mins ago • Node 3
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* User Profile */}
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
import { Bell, ChevronDown, User } from "lucide-react";

export default function Navbar({ setView, currentView, alerts = [] }) {
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            DigTwin
          </span>
        </div>
        <nav className="flex items-center gap-8 text-sm font-medium">
          {["overview", "analytics", "monitoring"].map((view) => (
            <button
              key={view}
              onClick={() => setView(view)}
              className={`capitalize transition-colors relative ${currentView === view ? "text-slate-900 font-bold" : "text-slate-500 hover:text-slate-900"}`}
            >
              {view}
              {currentView === view && (
                <span className="absolute -bottom-[22px] left-0 w-full h-[2px] bg-black rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-500 hover:text-slate-900" />
            {/* Only pulse red if there is actually an alert! */}
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 z-50 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-slate-900 text-sm">
                  Notifications
                </h4>
                <button
                  onClick={() => setShowNotifs(false)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-2">
                    No new alerts. Automated scout is monitoring.
                  </p>
                ) : (
                  alerts.map((alert, i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-start border-b border-slate-50 pb-2"
                    >
                      <div className="w-2 h-2 mt-2 bg-red-500 rounded-full shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {alert.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {alert.time} • Node: {alert.node}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
          <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
            <User className="w-5 h-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-slate-900">Admin User</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
              Agronomist
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" />
        </div>
      </div>
    </header>
  );
}
