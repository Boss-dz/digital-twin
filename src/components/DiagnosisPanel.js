// "use client";
// import {
//   X,
//   Upload,
//   Activity,
//   AlertTriangle,
//   CheckCircle,
//   Leaf,
//   ScanSearch,
// } from "lucide-react";
// import { useState, useEffect } from "react";
// import { Client } from "@gradio/client";

// const TREATMENT_DATABASE = {
//   healthy:
//     "Plant is in optimal condition. Maintain standard watering, nutrition, and monitoring routines.",
//   scab: "Fungal infection. Apply fungicides like Captan or Mancozeb. Rake and destroy fallen infected leaves to reduce spores. Ensure proper pruning for canopy airflow.",
//   frog_eye_leaf_spot:
//     "Fungal disease (Botryosphaeria). Prune and destroy dead or cankered wood where the fungus overwinters. Apply broad-spectrum fungicides and avoid overhead watering.",
//   rust: "Cedar Apple Rust detected. Apply preventive fungicides containing myclobutanil. Inspect nearby areas for alternative hosts (like cedar or juniper trees) and remove galls.",
//   powdery_mildew:
//     "Fungal detection. Apply sulfur-based fungicides or potassium bicarbonate. Improve air circulation by pruning dense canopy areas. Avoid excessive nitrogen fertilizer.",
//   complex:
//     "Multiple concurrent pathogens detected causing complex symptoms. Implement a rigorous broad-spectrum fungicide program. Immediately isolate the plant if possible, and ensure strict sanitation of pruning tools.",
// };

// export default function DiagnosisPanel({ isOpen, onClose, plantInfo }) {
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [xaiImage, setXaiImage] = useState(null);

//   // NEW: Listen for when the panel opens and auto-load the image if provided
//   useEffect(() => {
//     if (isOpen && plantInfo?.autoImage) {
//       loadAndAnalyzeAutoImage(plantInfo.autoImage);
//     } else if (!isOpen) {
//       // Clear the panel when closed
//       setFile(null);
//       setPreview(null);
//       setResult(null);
//       setXaiImage(null);
//     }
//   }, [isOpen, plantInfo]);

//   // NEW: Helper function to fetch the local camera image and run it
//   const loadAndAnalyzeAutoImage = async (imageUrl) => {
//     try {
//       const response = await fetch(imageUrl);
//       const blob = await response.blob();
//       const autoFile = new File([blob], "scout_auto.jpg", { type: blob.type });

//       setFile(autoFile);
//       setPreview(URL.createObjectURL(autoFile));

//       // Immediately run the AI analysis
//       runDeepAnalysis(autoFile);
//     } catch (error) {
//       console.error("Failed to auto-load image:", error);
//     }
//   };

//   const handleFileChange = (e) => {
//     const f = e.target.files[0];
//     if (f) {
//       setFile(f);
//       setPreview(URL.createObjectURL(f));
//       setResult(null);
//       setXaiImage(null);
//     }
//   };

//   // Separated the AI logic so both auto-load and manual-upload can use it
//   const runDeepAnalysis = async (targetFile) => {
//     if (!targetFile) return;
//     setLoading(true);

//     try {
//       const client = await Client.connect(
//         "Seroy/Efficientnet_lite0_All_Diseases",
//       );

//       const aiResponse = await client.predict("/predict", {
//         image: targetFile,
//       });

//       const out0 = aiResponse.data[0];
//       const out1 = aiResponse.data[1];

//       let prediction = null;
//       let heatmapData = null;

//       if (out0 && out0.confidences) {
//         prediction = out0;
//         heatmapData = out1;
//       } else if (out1 && out1.confidences) {
//         prediction = out1;
//         heatmapData = out0;
//       }

//       if (!prediction) {
//         throw new Error("Could not find label data in API response.");
//       }

//       const allConfidences = prediction.confidences || [];
//       let detected = allConfidences.filter((c) => c.confidence >= 0.3);

//       if (detected.length === 0 && allConfidences.length > 0) {
//         detected = [allConfidences[0]];
//       }

//       const formatName = (str) =>
//         str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

//       const detailedResults = detected.map((d) => {
//         const key = d.label.toLowerCase();
//         return {
//           name: formatName(d.label),
//           confidence: (d.confidence * 100).toFixed(1),
//           advice:
//             TREATMENT_DATABASE[key] ||
//             "Consult local agricultural guidelines for this anomaly.",
//         };
//       });

//       setResult({ details: detailedResults });

//       if (heatmapData) {
//         const imageUrl = heatmapData.url || heatmapData.path || heatmapData;
//         setXaiImage(imageUrl);
//       }
//     } catch (error) {
//       console.error("AI Prediction Error:", error);
//       setResult({
//         details: [
//           {
//             name: "API Connection Error",
//             confidence: "0",
//             advice:
//               "Failed to communicate with the Hugging Face AI model. Check the browser console.",
//           },
//         ],
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <div
//         className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
//         onClick={onClose}
//       />

//       <div
//         className={`fixed right-0 top-0 h-full w-[480px] bg-white border-l border-slate-200 shadow-2xl p-8 transition-transform duration-300 ease-in-out z-[100] overflow-y-auto
//           ${isOpen ? "translate-x-0" : "translate-x-full"}`}
//       >
//         <div className="flex justify-between items-start mb-10">
//           <div>
//             <h2 className="text-3xl font-extrabold text-slate-900">
//               Diagnostic Unit
//             </h2>
//             <p className="text-sm text-slate-500 font-medium mt-2 flex items-center gap-2">
//               <span className="bg-slate-100 px-3 py-1 rounded-full font-mono text-xs">
//                 ID: {plantInfo?.id || "Unknown"}
//               </span>
//               Target Plant
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 -mr-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Dynamic Alert Banner: Changes depending on auto vs manual */}
//         {plantInfo?.autoImage ? (
//           <div className="bg-red-50 p-6 mb-10 rounded-2xl border border-red-100 flex items-start gap-4">
//             <div className="p-3 bg-red-100 rounded-full text-red-600">
//               <AlertTriangle className="w-6 h-6" />
//             </div>
//             <div>
//               <p className="text-lg font-bold text-red-700">
//                 IoT Scout Anomaly
//               </p>
//               <p className="text-sm text-red-600/80 mt-1 font-medium leading-relaxed">
//                 Image captured via automated rail camera. Deep analysis
//                 generated automatically.
//               </p>
//             </div>
//           </div>
//         ) : (
//           <div className="bg-slate-50 p-6 mb-10 rounded-2xl border border-slate-200 flex items-start gap-4">
//             <div className="p-3 bg-slate-200 rounded-full text-slate-600">
//               <Upload className="w-6 h-6" />
//             </div>
//             <div>
//               <p className="text-lg font-bold text-slate-800">
//                 Manual Inspection
//               </p>
//               <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">
//                 No automated image available for this node. Please upload a
//                 photo manually.
//               </p>
//             </div>
//           </div>
//         )}

//         <div className="space-y-6">
//           <h3 className="text-xl font-bold text-slate-900">Image Source</h3>
//           <div
//             className={`border-3 border-dashed rounded-3xl p-8 text-center transition-all relative group ${preview ? "border-green-500 bg-green-50/30" : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"}`}
//           >
//             <input
//               type="file"
//               accept="image/*"
//               className="absolute inset-0 opacity-0 cursor-pointer z-10"
//               onChange={handleFileChange}
//             />
//             {preview ? (
//               <div className="relative">
//                 <img
//                   src={preview}
//                   alt="Upload"
//                   className="w-full h-64 object-cover rounded-2xl shadow-sm"
//                 />
//                 <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
//                   Click to override with manual image
//                 </div>
//               </div>
//             ) : (
//               <div className="flex flex-col items-center text-slate-500 py-6">
//                 <div className="p-5 bg-slate-100 rounded-full text-slate-400 mb-4 group-hover:bg-white group-hover:text-slate-600 transition-colors shadow-sm">
//                   <Upload className="w-8 h-8" />
//                 </div>
//                 <p className="text-lg font-bold text-slate-700 mb-1">
//                   Upload leaf closeup
//                 </p>
//                 <span className="text-sm font-medium">
//                   Drag and drop or click to browse
//                 </span>
//               </div>
//             )}
//           </div>

//           <button
//             onClick={() => runDeepAnalysis(file)}
//             disabled={!file || loading}
//             className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-green-600/20 hover:shadow-green-600/30 hover:-translate-y-1"
//           >
//             {loading ? (
//               <>
//                 <svg
//                   className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   ></path>
//                 </svg>
//                 Running AI Model...
//               </>
//             ) : (
//               <>
//                 <Activity className="w-6 h-6" /> Run Deep Analysis
//               </>
//             )}
//           </button>
//         </div>

//         {result && (
//           <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-500 mb-8">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="p-2 bg-green-100 text-green-600 rounded-full">
//                 <CheckCircle className="w-6 h-6" />
//               </div>
//               <h3 className="text-2xl font-extrabold text-slate-900">
//                 Analysis Report
//               </h3>
//             </div>

//             <div className="bg-slate-50 rounded-3xl p-8 space-y-6 border border-slate-200 shadow-sm">
//               {xaiImage && (
//                 <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm col-span-2 animate-in zoom-in-95 duration-300">
//                   <p className="text-sm text-slate-500 font-bold mb-4 flex items-center gap-2">
//                     <ScanSearch className="w-4 h-4 text-blue-500" />
//                     AI Focus Region (Grad-CAM)
//                   </p>
//                   <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-100">
//                     <img
//                       src={xaiImage}
//                       alt="AI Attention Heatmap"
//                       className="w-full h-auto object-cover"
//                     />
//                   </div>
//                   <p className="text-[10px] text-slate-400 font-medium mt-3 leading-tight text-center">
//                     Highlighted areas indicate specific visual patterns the
//                     neural network used to make its diagnosis.
//                   </p>
//                 </div>
//               )}

//               <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
//                 <p className="text-sm text-slate-500 font-bold mb-4">
//                   Detected Pathogens Breakdown
//                 </p>
//                 <div className="space-y-3">
//                   {result.details.map((item, idx) => (
//                     <div
//                       key={idx}
//                       className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0"
//                     >
//                       <span className="text-lg font-extrabold text-red-600">
//                         {item.name}
//                       </span>
//                       <span className="text-base font-bold text-green-600 font-mono bg-green-50 px-3 py-1 rounded-lg">
//                         {item.confidence}%
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="pt-6 border-t border-slate-200">
//                 <p className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
//                   <Leaf className="w-5 h-5 text-green-600" />
//                   Recommended Action Plan
//                 </p>
//                 <div className="space-y-3">
//                   {result.details.map((item, idx) => (
//                     <div
//                       key={idx}
//                       className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
//                     >
//                       <span className="block text-sm font-bold text-slate-800 mb-1">
//                         {item.name}:
//                       </span>
//                       <span className="text-slate-600 font-medium text-sm leading-relaxed">
//                         {item.advice}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

"use client";
import {
  X,
  Upload,
  Activity,
  AlertTriangle,
  CheckCircle,
  Leaf,
  ScanSearch,
  FileUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Client } from "@gradio/client";

// ... (Keep TREATMENT_DATABASE exactly the same) ...
const TREATMENT_DATABASE = {
  healthy:
    "Plant is in optimal condition. Maintain standard watering, nutrition, and monitoring routines.",
  scab: "Fungal infection. Apply fungicides like Captan or Mancozeb. Rake and destroy fallen infected leaves to reduce spores. Ensure proper pruning for canopy airflow.",
  frog_eye_leaf_spot:
    "Fungal disease (Botryosphaeria). Prune and destroy dead or cankered wood where the fungus overwinters. Apply broad-spectrum fungicides and avoid overhead watering.",
  rust: "Cedar Apple Rust detected. Apply preventive fungicides containing myclobutanil. Inspect nearby areas for alternative hosts (like cedar or juniper trees) and remove galls.",
  powdery_mildew:
    "Fungal detection. Apply sulfur-based fungicides or potassium bicarbonate. Improve air circulation by pruning dense canopy areas. Avoid excessive nitrogen fertilizer.",
  complex:
    "Multiple concurrent pathogens detected causing complex symptoms. Implement a rigorous broad-spectrum fungicide program. Immediately isolate the plant if possible, and ensure strict sanitation of pruning tools.",
};

export default function DiagnosisPanel({ isOpen, onClose, plantInfo }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [xaiImage, setXaiImage] = useState(null);

  // NEW: Updated initialization logic
  useEffect(() => {
    if (isOpen && plantInfo) {
      if (plantInfo.manualFile) {
        // CASE 1: Manual upload from Home Screen (It's already a File object)
        setFile(plantInfo.manualFile);
        setPreview(URL.createObjectURL(plantInfo.manualFile));
        runDeepAnalysis(plantInfo.manualFile);
      } else if (plantInfo.autoImage) {
        // CASE 2: Automated camera click (It's a URL string, need to fetch it)
        loadAndAnalyzeAutoImage(plantInfo.autoImage);
      }
    } else if (!isOpen) {
      // Reset when closed
      setFile(null);
      setPreview(null);
      setResult(null);
      setXaiImage(null);
    }
  }, [isOpen, plantInfo]);

  // Helper function to fetch the local camera image URL and turn it into a File
  const loadAndAnalyzeAutoImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const autoFile = new File([blob], "scout_auto.jpg", { type: blob.type });

      setFile(autoFile);
      setPreview(URL.createObjectURL(autoFile));

      // Immediately run the AI analysis
      runDeepAnalysis(autoFile);
    } catch (error) {
      console.error("Failed to auto-load image:", error);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setXaiImage(null);
    }
  };

  // The main AI logic (kept the same)
  const runDeepAnalysis = async (targetFile) => {
    if (!targetFile) return;
    setLoading(true);
    setResult(null); // Clear previous results while loading
    setXaiImage(null);

    try {
      const client = await Client.connect(
        "Seroy/Efficientnet_lite0_All_Diseases",
      );
      const aiResponse = await client.predict("/predict", {
        image: targetFile,
      });

      const out0 = aiResponse.data[0];
      const out1 = aiResponse.data[1];
      let prediction = null;
      let heatmapData = null;

      if (out0 && out0.confidences) {
        prediction = out0;
        heatmapData = out1;
      } else if (out1 && out1.confidences) {
        prediction = out1;
        heatmapData = out0;
      }

      if (!prediction)
        throw new Error("Could not find label data in API response.");

      const allConfidences = prediction.confidences || [];
      let detected = allConfidences.filter((c) => c.confidence >= 0.3);
      if (detected.length === 0 && allConfidences.length > 0) {
        detected = [allConfidences[0]];
      }

      const formatName = (str) =>
        str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

      const detailedResults = detected.map((d) => {
        const key = d.label.toLowerCase();
        return {
          name: formatName(d.label),
          confidence: (d.confidence * 100).toFixed(1),
          advice:
            TREATMENT_DATABASE[key] ||
            "Consult local agricultural guidelines for this anomaly.",
        };
      });

      setResult({ details: detailedResults });

      if (heatmapData) {
        const imageUrl = heatmapData.url || heatmapData.path || heatmapData;
        setXaiImage(imageUrl);
      }
    } catch (error) {
      console.error("AI Prediction Error:", error);
      setResult({
        details: [
          {
            name: "API Connection Error",
            confidence: "0",
            advice: "Failed to communicate with the Hugging Face AI model.",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[90] transition-opacity duration-500 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <div
        className={`fixed right-0 top-0 h-full w-[500px] bg-white/90 backdrop-blur-2xl border-l border-white/50 shadow-2xl p-8 transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) z-[100] overflow-y-auto
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Diagnostic Unit
            </h2>
            <p className="text-sm text-slate-500 font-bold mt-2 flex items-center gap-2 uppercase tracking-wider">
              <span className="bg-slate-100 px-3 py-1 rounded-full">
                ID: {plantInfo?.id || "Unknown"}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Dynamic Banner based on source */}
        {plantInfo?.autoImage && (
          <div className="bg-red-50 p-6 mb-8 rounded-[1.5rem] border border-red-100 flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-2xl text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg font-black text-red-700 leading-none">
                IoT Scout Anomaly
              </p>
              <p className="text-sm text-red-600/80 mt-2 font-bold leading-relaxed">
                Automated rail camera capture. Deep analysis running...
              </p>
            </div>
          </div>
        )}
        {plantInfo?.manualFile && (
          <div className="bg-blue-50 p-6 mb-8 rounded-[1.5rem] border border-blue-100 flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg font-black text-blue-700 leading-none">
                Manual Upload
              </p>
              <p className="text-sm text-blue-600/80 mt-2 font-bold leading-relaxed">
                Analysing user-submitted image...
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div
            className={`border-4 border-dashed rounded-[2rem] p-4 text-center transition-all relative group ${preview ? "border-green-500/50 bg-green-50/30" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
          >
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
            />
            {preview ? (
              <div className="relative rounded-[1.5rem] overflow-hidden">
                <img
                  src={preview}
                  alt="Upload"
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold tracking-wider">
                  Click to change image
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-500 py-12">
                <div className="p-6 bg-slate-100 rounded-full text-slate-400 mb-4 group-hover:bg-white group-hover:text-slate-600 transition-colors shadow-sm">
                  <Upload className="w-10 h-10" />
                </div>
                <p className="text-xl font-black text-slate-700 mb-1">
                  Upload leaf closeup
                </p>
                <span className="text-sm font-bold text-slate-400">
                  Drag and drop or click to browse
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => runDeepAnalysis(file)}
            disabled={!file || loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 rounded-[1.5rem] text-xl font-black flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-green-600/20 hover:shadow-green-600/40 hover:-translate-y-1"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <Activity className="w-7 h-7" /> Run Deep Analysis
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                Analysis Report
              </h3>
            </div>

            <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 space-y-8 border border-white/50 shadow-lg">
              {xaiImage && (
                <div className="bg-slate-50/80 p-6 rounded-[2rem] border border-slate-200/50 shadow-sm">
                  <p className="text-sm text-slate-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ScanSearch className="w-4 h-4 text-blue-500" /> AI Focus
                    Region (Grad-CAM)
                  </p>
                  <div className="rounded-[1.5rem] overflow-hidden border border-slate-200/50 bg-white shadow-sm">
                    <img
                      src={xaiImage}
                      alt="AI Attention Heatmap"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <p className="text-xs text-slate-400 font-bold mt-4 leading-tight text-center max-w-sm mx-auto">
                    Areas highlighted in warmer colors indicate patterns the
                    neural network used for diagnosis.
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-slate-500 font-black uppercase tracking-widest mb-4">
                  Detected Pathogens
                </p>
                <div className="space-y-3">
                  {result.details.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
                    >
                      <span className="text-xl font-black text-red-600">
                        {item.name}
                      </span>
                      <span className="text-lg font-black text-green-600 font-mono bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                        {item.confidence}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-200/50">
                <p className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <Leaf className="w-6 h-6 text-green-600" /> Recommended Action
                  Plan
                </p>
                <div className="space-y-4">
                  {result.details.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
                    >
                      <span className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wider">
                        {item.name}:
                      </span>
                      <span className="text-slate-600 font-bold text-sm leading-relaxed">
                        {item.advice}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}