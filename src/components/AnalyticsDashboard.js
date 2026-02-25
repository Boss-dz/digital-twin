import { BarChart3, Leaf, Droplets, Zap } from "lucide-react";

export default function AnalyticsDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-900">Farm Analytics</h2>
        <div className="flex gap-2 bg-white/60 p-1.5 rounded-2xl backdrop-blur-xl border border-white">
          <button className="px-5 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-slate-900">
            7 Days
          </button>
          <button className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
            30 Days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placeholder for future Thesis Chart */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white shadow-xl shadow-slate-200/30 flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
          <BarChart3 className="w-20 h-20 mb-6 opacity-40 animate-pulse" />
          <h3 className="text-xl font-black text-slate-700 mb-2">
            Disease Progression Over Time
          </h3>
          <p className="text-sm font-medium text-center max-w-md">
            Space reserved for your thesis data visualization. We can build a
            line chart here showing the rate of detected pathogens vs. healthy
            plants.
          </p>
        </div>

        {/* Existing Growth Metrics */}
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-lg shadow-slate-200/30 flex items-center gap-6">
            <div className="bg-green-100 p-4 rounded-2xl text-green-600">
              <Leaf className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                CO2 Levels
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">420</span>
                <span className="text-sm font-bold text-slate-400">ppm</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-lg shadow-slate-200/30 flex items-center gap-6">
            <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
              <Droplets className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                Soil pH
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">5.8</span>
                <span className="text-sm font-bold text-slate-400">lvl</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-lg shadow-slate-200/30 flex items-center gap-6">
            <div className="bg-yellow-100 p-4 rounded-2xl text-yellow-600">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                Power Draw
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">56.4</span>
                <span className="text-sm font-bold text-slate-400">kW</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
