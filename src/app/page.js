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
  const [weather, setWeather] = useState({
    temp: "--",
    humid: "--",
    soil: "--",
    light: "--",
  });

  const [alerts, setAlerts] = useState([]);
  const [sickPlants, setSickPlants] = useState([]);
  const [focusPlant, setFocusPlant] = useState(null);

  const [isScouting, setIsScouting] = useState(false);
  const scoutingRef = useRef(isScouting);
  const currentIndexRef = useRef(0);
  const [nodesStatus, setNodesStatus] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/analytics/data`);
        const data = await response.json();

        if (data && data.length > 0) {
          const latest = data[data.length - 1];

          setWeather({
            temp: Math.round(latest.temp) + "°C",
            humid: latest.humidity + "%",
            soil: Math.round(latest.soil) + "%",
            light: Math.round(latest.light) + " W/m²",
          });

          // 🟢 NOUVELLE FONCTIONNALITÉ : Alerte Prédictive Humidité
          if (latest.humidity > 65) {
            setAlerts((prevAlerts) => {
              // On vérifie si l'alerte n'existe pas déjà pour ne pas la dupliquer
              const hasHumidityAlert = prevAlerts.some(
                (a) => a.id === "alert_humidity",
              );

              if (!hasHumidityAlert) {
                const newAlert = {
                  id: "alert_humidity",
                  title: "CRITICAL HUMIDITY (>85%)",
                  node: "Global Greenhouse Environment",
                  time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  // On peut ajouter une info pour dire à l'UI que c'est une alerte météo
                  isEnvironmental: true,
                };
                // On ajoute la nouvelle alerte au début de la liste
                return [newAlert, ...prevAlerts];
              }
              return prevAlerts;
            });
          } else {
            // (Optionnel) Si l'humidité redescend sous 85%, on supprime l'alerte
            setAlerts((prevAlerts) =>
              prevAlerts.filter((a) => a.id !== "alert_humidity"),
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch MongoDB Analytics:", error);
      }
    };
    const fetchNodes = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/nodes`);
        const data = await response.json();
        setNodesStatus(data);
      } catch (error) {
        console.error("Failed to fetch nodes status:", error);
      }
    };
    fetchAnalytics();
    fetchNodes();
    const interval = setInterval(() => {
      fetchAnalytics();
      fetchNodes(); // 🟢 Mise à jour chaque minute
    }, 60000);
    return () => clearInterval(interval);
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
          formData.append("node_id", currentCamera.plantIndex);

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
              nodesStatus={nodesStatus}
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
