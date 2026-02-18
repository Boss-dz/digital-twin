import { Thermometer, Droplets, Sun, Wind } from "lucide-react";

const StatItem = ({ icon: Icon, label, value, unit, color }) => (
  <div className="flex items-center gap-3 px-6 py-3 border-r border-white/10 last:border-0 min-w-[140px]">
    <div className={`p-2 rounded-lg bg-gray-800 text-${color}-400`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="text-lg font-bold text-white">
        {value}
        <span className="text-sm text-gray-500 ml-1">{unit}</span>
      </p>
    </div>
  </div>
);

export default function StatsOverlay() {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-1 shadow-2xl flex flex-nowrap overflow-x-auto max-w-[95vw]">
      <StatItem
        icon={Thermometer}
        label="Temp"
        value="24.5"
        unit="°C"
        color="red"
      />
      <StatItem
        icon={Droplets}
        label="Humidity"
        value="62"
        unit="%"
        color="blue"
      />
      <StatItem
        icon={Sun}
        label="Light"
        value="840"
        unit="lux"
        color="yellow"
      />
      <StatItem icon={Wind} label="CO2" value="410" unit="ppm" color="green" />
    </div>
  );
}