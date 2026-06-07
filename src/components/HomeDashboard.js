import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  AlertTriangle,
  CheckCircle2,
  ScanSearch,
  Upload,
  Leaf,
  Activity,
  Play,
  Square,
} from "lucide-react";
import { useState, useCallback } from "react";

export default function HomeDashboard({
  weather,
  alerts,
  onAlertClick,
  onManualUpload,
  totalPlants,
  sickCount,
  isPanelOpen,
  isScouting,
  onToggleScouting,
}) {
  const healthPercentage =
    Math.round(((totalPlants - sickCount) / totalPlants) * 100) || 100;
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave" || e.type === "drop") setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0])
        onManualUpload(e.dataTransfer.files[0]);
    },
    [onManualUpload],
  );

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) onManualUpload(e.target.files[0]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Health Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-green-500/20 rounded-full blur-3xl group-hover:bg-green-500/30 transition-all duration-1000" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                System Status
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-7xl font-black tracking-tighter">
                  {healthPercentage}%
                </span>
                <span className="text-2xl font-bold text-green-400">
                  Optimal
                </span>
              </div>
            </div>
            <div className="mt-8 flex justify-between items-end gap-4">
              <div>
                <p className="max-w-md text-slate-300 font-medium leading-relaxed mb-6">
                  {sickCount === 0
                    ? "AI scouts ready. Start sequence to begin monitoring."
                    : `${sickCount} anomalies detected. Review alerts queue immediately.`}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onToggleScouting}
                    className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${isScouting ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30" : "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30"}`}
                  >
                    {isScouting ? (
                      <>
                        <Square className="w-4 h-4" /> Stop Scout
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" /> Start Scout
                      </>
                    )}
                  </button>
                  {isScouting && (
                    <div className="text-xs text-green-400 font-bold uppercase tracking-widest animate-pulse flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Running...
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 hidden md:flex">
                <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/5">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Active Nodes
                    </p>
                    <p className="font-black text-lg">{totalPlants}</p>
                  </div>
                </div>
                <div
                  className={`backdrop-blur-md px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/5 ${sickCount > 0 ? "bg-red-500/20 border-red-500/30" : "bg-white/10"}`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 ${sickCount > 0 ? "text-red-400 animate-pulse" : "text-slate-400"}`}
                  />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Threats
                    </p>
                    <p className="font-black text-lg">{sickCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🟢 THE FIX: Weather Widgets now use dynamic data! */}
        <div className="grid grid-cols-2 gap-4">
          <AliveWidget
            icon={Thermometer}
            label="Air Temp"
            value={weather.temp}
            bg="bg-orange-50"
            color="text-orange-600"
            delay="0ms"
          />
          <AliveWidget
            icon={Droplets}
            label="Soil VWC"
            value={weather.soil}
            bg="bg-blue-50"
            color="text-blue-600"
            delay="100ms"
          />
          <AliveWidget
            icon={Wind}
            label="Humidity"
            value={weather.humid}
            bg="bg-sky-50"
            color="text-sky-600"
            delay="200ms"
          />
          <AliveWidget
            icon={Sun}
            label="Light PAR"
            value={weather.light}
            bg="bg-amber-50"
            color="text-amber-600"
            delay="300ms"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch lg:h-[400px]">
        {/* Left Column: Drag and Drop Widget */}
        <div
          className={`relative rounded-[2.5rem] p-1 overflow-hidden transition-all duration-300 flex flex-col h-full ${isDragging ? "bg-green-500 scale-[1.02] shadow-xl" : "bg-gradient-to-r from-slate-200 to-slate-100 shadow-sm"}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-[2.4rem] p-8 flex flex-col items-center justify-center text-center border border-white flex-1 group">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              onChange={handleFileSelect}
            />
            <div
              className={`w-20 h-20 mb-6 rounded-3xl flex items-center justify-center transition-all duration-300 ${isDragging ? "bg-green-100 text-green-600 scale-110" : "bg-slate-100 text-slate-400 group-hover:bg-green-50 group-hover:text-green-500 group-hover:scale-105"}`}
            >
              {isDragging ? (
                <Leaf className="w-10 h-10 animate-bounce" />
              ) : (
                <Upload className="w-10 h-10" />
              )}
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              {isDragging ? "Drop to Analyze" : "Manual Disease Check"}
            </h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
              Drag and drop a leaf image here, or click to browse. Our Grad-CAM
              AI will analyze it instantly.
            </p>
          </div>
        </div>

        {/* Right Column: Alerts Queue */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm flex flex-col p-8 h-full relative overflow-hidden">
          {isPanelOpen ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-slate-50/80 backdrop-blur-sm z-20">
              <Activity className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
              <h4 className="text-xl font-black text-slate-700">
                Diagnostic Panel Active
              </h4>
              <p className="text-slate-500 font-medium mt-1 max-w-xs">
                Close the diagnosis side panel to view the alerts queue.
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  Action Required
                </h3>
                {alerts.length > 0 && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] uppercase tracking-widest animate-pulse">
                    Live
                  </span>
                )}
              </div>
              <div className="flex-1 relative">
                {alerts.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-30" />
                    <h4 className="text-xl font-black text-slate-700">
                      No Active Threats
                    </h4>
                    <p className="text-slate-500 font-medium mt-1">
                      Start the AI scout to begin monitoring.
                    </p>
                  </div>
                ) : (
                  <div className="absolute inset-0 overflow-y-auto pr-2 custom-scrollbar pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          onClick={() => onAlertClick(alert.plantIndex)}
                          className="bg-white/90 backdrop-blur-xl p-5 rounded-[2rem] border border-red-100/50 shadow-lg shadow-red-100/20 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[160px]"
                        >
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-400" />
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <div className="bg-red-50 p-2.5 rounded-2xl text-red-600 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                                <AlertTriangle className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded-full text-slate-500">
                                {alert.time}
                              </span>
                            </div>
                            <h4 className="font-black text-slate-900 text-lg leading-tight mb-1">
                              {alert.title}
                            </h4>
                            <p className="text-xs font-bold text-slate-500 truncate">
                              {alert.node}
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-black text-slate-400 flex items-center justify-between group-hover:text-slate-900 transition-colors">
                            <span>FLY TO NODE</span>
                            <ScanSearch className="w-3 h-3 group-hover:animate-ping" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AliveWidget({ icon: Icon, label, value, bg, color, delay }) {
  return (
    <div
      className={`${bg} rounded-[2rem] p-6 shadow-sm border border-white/50 relative overflow-hidden flex flex-col justify-between hover:scale-[1.03] transition-transform duration-300 animate-in zoom-in-95`}
      style={{ animationDelay: delay, animationFillMode: "both" }}
    >
      <div className="flex items-center gap-2 mb-4 opacity-80">
        <Icon className={`w-5 h-5 ${color}`} />
        <span
          className={`text-[10px] font-black uppercase tracking-widest ${color}`}
        >
          {label}
        </span>
      </div>
      <div className="text-3xl font-black tracking-tighter text-slate-900">
        {value}
      </div>
    </div>
  );
}