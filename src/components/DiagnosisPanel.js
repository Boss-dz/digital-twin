"use client";
import { X, Upload, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function DiagnosisPanel({ isOpen, onClose, plantId }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
    }
  };

  const handleAnalysis = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResult({
        disease: "Apple Scab",
        confidence: 98.5,
        treatment:
          "Apply fungicides like Captan or Myclobutanil. Prune infected leaves to prevent spread.",
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-[480px] bg-white border-l border-slate-200 shadow-2xl p-8 transition-transform duration-300 ease-in-out z-[100] overflow-y-auto
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Diagnostic Unit
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-2 flex items-center gap-2">
              <span className="bg-slate-100 px-3 py-1 rounded-full font-mono text-xs">
                ID: {plantId}
              </span>
              Target Plant
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Alert Banner - Modern Style */}
        <div className="bg-red-50 p-6 mb-10 rounded-2xl border border-red-100 flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-lg font-bold text-red-700">Anomaly Detected</p>
            <p className="text-sm text-red-600/80 mt-1 font-medium leading-relaxed">
              Automated scout reported visual lesions on this plant. Manual
              verification is required.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900">
            Manual Verification
          </h3>
          <div
            className={`border-3 border-dashed rounded-3xl p-8 text-center transition-all relative group ${preview ? "border-green-500 bg-green-50/30" : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"}`}
          >
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
            />
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Upload"
                  className="w-full h-64 object-cover rounded-2xl shadow-sm"
                />
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                  Click to change image
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-500 py-6">
                <div className="p-5 bg-slate-100 rounded-full text-slate-400 mb-4 group-hover:bg-white group-hover:text-slate-600 transition-colors shadow-sm">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-lg font-bold text-slate-700 mb-1">
                  Upload leaf closeup
                </p>
                <span className="text-sm font-medium">
                  Drag and drop or click to browse
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalysis}
            disabled={!file || loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-green-600/20 hover:shadow-green-600/30 hover:-translate-y-1"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Running Analysis...
              </>
            ) : (
              <>
                <Activity className="w-6 h-6" /> Run Deep Analysis
              </>
            )}
          </button>
        </div>

        {/* Results - Modern Card */}
        {result && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 text-green-600 rounded-full">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                Analysis Report
              </h3>
            </div>

            <div className="bg-slate-50 rounded-3xl p-8 space-y-6 border border-slate-200 shadow-sm">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-sm text-slate-500 font-bold mb-1">
                    Diagnosis
                  </p>
                  <p className="text-xl font-extrabold text-red-600">
                    {result.disease}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-sm text-slate-500 font-bold mb-1">
                    Confidence
                  </p>
                  <p className="text-xl font-extrabold text-green-600 font-mono">
                    {result.confidence}%
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <p className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Recommended Action
                </p>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 text-slate-600 font-medium leading-relaxed shadow-sm">
                  {result.treatment}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
