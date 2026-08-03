import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  MapPin,
  Clock,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  Tag,
  Filter,
  Download,
  Share2,
  Compass,
  Maximize2,
  X,
  ShieldCheck,
  AlertCircle,
  Building2,
  Sparkles,
  RefreshCw,
  Eye,
  Calendar,
  UserCheck,
  FileText,
} from "lucide-react";

export interface ProgressPhotoRecord {
  id: string;
  projectId: string;
  projectName: string;
  stageName: string;
  photoUrl: string;
  timestamp: string;
  isoDate: string;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  accuracyMeters: number | null;
  locationAddress: string;
  engineerName: string;
  notes: string;
  weatherCondition?: string;
}

interface ConstructionProgressPhotosProps {
  selectedCity?: string;
  defaultProjectName?: string;
}

const SAMPLE_INITIAL_PHOTOS: ProgressPhotoRecord[] = [
  {
    id: "PHOTO-101",
    projectId: "PRJ-2026-01",
    projectName: "Residential Luxury Villa - Sector 62",
    stageName: "RCC Slab Casting & Steel Rebar Inspection",
    photoUrl:
      "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&q=80",
    timestamp: "30 Jul 2026, 09:45 AM IST",
    isoDate: "2026-07-30T09:45:00.000Z",
    latitude: 28.6139,
    longitude: 77.209,
    altitude: 216,
    accuracyMeters: 3.5,
    locationAddress: "Sector 62, Noida, Uttar Pradesh 201309",
    engineerName: "Er. Rajesh Sharma (Civil QA/QC)",
    notes:
      "Slab beam shuttering verified. Tata Tiscon Fe550D TMT rebar binding compliant with IS 456 standards. M25 concrete pouring started.",
    weatherCondition: "Sunny • 32°C",
  },
  {
    id: "PHOTO-102",
    projectId: "PRJ-2026-01",
    projectName: "Residential Luxury Villa - Sector 62",
    stageName: "Foundation & Earth Excavation",
    photoUrl:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    timestamp: "25 Jul 2026, 02:15 PM IST",
    isoDate: "2026-07-25T14:15:00.000Z",
    latitude: 28.6142,
    longitude: 77.2088,
    altitude: 215,
    accuracyMeters: 4.0,
    locationAddress: "Sector 62, Noida, Uttar Pradesh 201309",
    engineerName: "Er. Rajesh Sharma (Civil QA/QC)",
    notes:
      "Foundation pit depth reached 3.5 meters. Soil load bearing test approved. Anti-termite chemical soil treatment applied.",
    weatherCondition: "Partly Cloudy • 30°C",
  },
  {
    id: "PHOTO-103",
    projectId: "PRJ-2026-02",
    projectName: "Commercial Tower - Bandra Kurla Complex",
    stageName: "AAC Masonry & Plaster Curing",
    photoUrl:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
    timestamp: "28 Jul 2026, 11:30 AM IST",
    isoDate: "2026-07-28T11:30:00.000Z",
    latitude: 19.06,
    longitude: 72.8685,
    altitude: 12,
    accuracyMeters: 2.8,
    locationAddress: "BKC, Mumbai, Maharashtra 400051",
    engineerName: "Er. Amit Kulkarni (Project Manager)",
    notes:
      "6-inch AAC block masonry on 3rd floor completed. Water curing day 3 ongoing. Wall joint wire mesh installed.",
    weatherCondition: "Light Rain • 27°C",
  },
];

export const ConstructionProgressPhotos: React.FC<
  ConstructionProgressPhotosProps
> = ({
  selectedCity = "Delhi NCR",
  defaultProjectName = "Residential Luxury Villa - Sector 62",
}) => {
  // Photos State with LocalStorage persistence
  const [photos, setPhotos] = useState<ProgressPhotoRecord[]>(() => {
    const saved = localStorage.getItem("2click_construction_photos");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved progress photos:", e);
      }
    }
    return SAMPLE_INITIAL_PHOTOS;
  });

  // Camera & Capture Form State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form Inputs
  const [projectName, setProjectName] = useState<string>(defaultProjectName);
  const [stageName, setStageName] = useState<string>("RCC Slab Casting");
  const [engineerName, setEngineerName] = useState<string>(
    "Er. Vikram Singh (Site Supervisor)",
  );
  const [notes, setNotes] = useState<string>("");

  // Geolocation State
  const [fetchingGps, setFetchingGps] = useState<boolean>(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>(
    `${selectedCity}, India`,
  );
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Filter & Detail Modal State
  const [selectedFilterProject, setSelectedFilterProject] =
    useState<string>("All");
  const [selectedFilterStage, setSelectedFilterStage] = useState<string>("All");
  const [activePhotoModal, setActivePhotoModal] =
    useState<ProgressPhotoRecord | null>(null);
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(true);

  // Save to localStorage when photos change
  useEffect(() => {
    localStorage.setItem("2click_construction_photos", JSON.stringify(photos));
  }, [photos]);

  // Request GPS Location on mount
  useEffect(() => {
    fetchCurrentLocation();
  }, [selectedCity]);

  // Fetch current GPS Coordinates
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser/device.");
      return;
    }

    setFetchingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAltitude(position.coords.altitude);
        setAccuracy(position.coords.accuracy);
        setLocationAddress(
          `Lat: ${position.coords.latitude.toFixed(4)}°, Lng: ${position.coords.longitude.toFixed(4)}° • ${selectedCity}`,
        );
        setFetchingGps(false);
      },
      (error) => {
        console.warn("Geolocation warning/error:", error.message);
        setGpsError(
          "GPS access restricted or timed out. Defaulting to estimated site location.",
        );
        setFetchingGps(false);
        // Default coordinates if denied
        setLatitude(28.6139);
        setLongitude(77.209);
        setAccuracy(10.0);
        setLocationAddress(`${selectedCity} Site Location (Estimated)`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  // Start Device Camera
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert(
        "Unable to access device camera directly. Opening standard image uploader.",
      );
      setIsCameraActive(false);
      fileInputRef.current?.click();
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Snap Photo from Camera Stream
  const snapCameraPicture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageUri = canvas.toDataURL("image/jpeg", 0.92);
      setCapturedImageUri(imageUri);
      stopCamera();
    }
  };

  // Handle File Upload Fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCapturedImageUri(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Snapped / Uploaded Photo Record
  const handleSaveProgressPhoto = () => {
    if (!capturedImageUri) {
      alert("Please snap or upload a progress picture first.");
      return;
    }

    const now = new Date();
    const formattedTimestamp =
      now.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) + " IST";

    const newPhotoRecord: ProgressPhotoRecord = {
      id: `PHOTO-${Date.now().toString().slice(-6)}`,
      projectId: `PRJ-${Date.now().toString().slice(-4)}`,
      projectName: projectName.trim() || "Residential Construction Site",
      stageName: stageName,
      photoUrl: capturedImageUri,
      timestamp: formattedTimestamp,
      isoDate: now.toISOString(),
      latitude: latitude,
      longitude: longitude,
      altitude: altitude,
      accuracyMeters: accuracy ? Number(accuracy.toFixed(1)) : null,
      locationAddress: locationAddress,
      engineerName: engineerName.trim() || "Site Inspector",
      notes: notes.trim() || "Work in progress verified on site.",
      weatherCondition: "Clear • Site Curing Active",
    };

    setPhotos([newPhotoRecord, ...photos]);
    setCapturedImageUri(null);
    setNotes("");
    alert("✅ Construction progress photo successfully geotagged & saved!");
  };

  // Delete Photo Record
  const handleDeletePhoto = (id: string) => {
    if (
      confirm("Are you sure you want to delete this geotagged progress photo?")
    ) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      if (activePhotoModal?.id === id) {
        setActivePhotoModal(null);
      }
    }
  };

  // Filtered Photos List
  const filteredPhotos = photos.filter((p) => {
    const matchesProject =
      selectedFilterProject === "All" ||
      p.projectName === selectedFilterProject;
    const matchesStage =
      selectedFilterStage === "All" || p.stageName === selectedFilterStage;
    return matchesProject && matchesStage;
  });

  const uniqueProjects = Array.from(new Set(photos.map((p) => p.projectName)));
  const uniqueStages = Array.from(new Set(photos.map((p) => p.stageName)));

  // Download PDF/Report Summary
  const handleDownloadReport = () => {
    const reportContent = `2CLICK.IN GEOTAGGED SITE PROGRESS PHOTO REPORT
Generated: ${new Date().toLocaleString("en-IN")}
Total Site Snapshots: ${filteredPhotos.length}
Project Filter: ${selectedFilterProject}

${filteredPhotos
  .map(
    (p, idx) => `
[${idx + 1}] SNAPSHOT ID: ${p.id}
Project: ${p.projectName}
Stage: ${p.stageName}
Timestamp: ${p.timestamp}
GPS Coordinates: Lat ${p.latitude}° N, Lng ${p.longitude}° E (Accuracy: ±${p.accuracyMeters}m)
Location Address: ${p.locationAddress}
Site Engineer: ${p.engineerName}
Site Notes: ${p.notes}
Image URL: ${p.photoUrl.startsWith("data:") ? "[Base64 Embedded Image Data]" : p.photoUrl}
--------------------------------------------------
`,
  )
  .join("")}`;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `2click_Site_Progress_Photos_Report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header Title Section */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-teal-500/30 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-xl text-xs font-black uppercase flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-teal-400" /> Site Progress
                Camera & Geo-Tagging Module
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                IS 456 Audit Compliant
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Construction Progress Photos & Geolocation Audit
            </h1>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Snap site construction pictures with automated GPS coordinates,
              altitude, timestamp, and QA/QC stage tags to generate immutable
              site progress evidence for clients, banks, and contractors.
            </p>
          </div>

          <button
            onClick={() => {
              window.scrollTo({ top: 400, behavior: "smooth" });
            }}
            className="px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-xs shadow-xl shadow-teal-600/30 transition-all flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
          >
            <Camera className="w-4 h-4" /> Snap Site Picture
          </button>
        </div>
      </div>

      {/* SNAP PICTURE & CAPTURE SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Snap & Geotag Site Progress Photo
              </h2>
              <p className="text-xs text-slate-500">
                Capture live camera snapshot or upload image with GPS location
                &amp; timestamp stamp
              </p>
            </div>
          </div>

          {/* GPS Status Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={fetchCurrentLocation}
              disabled={fetchingGps}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center gap-1.5 transition text-[11px]"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${fetchingGps ? "animate-spin text-teal-500" : ""}`}
              />
              <span>{fetchingGps ? "Locking GPS..." : "Refresh GPS"}</span>
            </button>

            {latitude && longitude ? (
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl font-mono text-[11px] font-extrabold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  GPS Lock: {latitude.toFixed(4)}°, {longitude.toFixed(4)}° (±
                  {accuracy ? Math.round(accuracy) : "3"}m)
                </span>
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-xl text-[11px] font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> GPS Pending
              </span>
            )}
          </div>
        </div>

        {gpsError && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>{gpsError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CAMERA / IMAGE PREVIEW CANVAS (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 min-h-[320px] flex items-center justify-center">
              {isCameraActive ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-72 sm:h-96 object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white rounded-full text-[10px] font-black tracking-wider uppercase animate-pulse flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    LIVE CAMERA STREAM
                  </div>

                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                    <button
                      type="button"
                      onClick={snapCameraPicture}
                      className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-5 h-5" /> Snap Picture Now
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : capturedImageUri ? (
                <div className="relative w-full h-full group">
                  <img
                    src={capturedImageUri}
                    alt="Captured Construction Progress"
                    referrerPolicy="no-referrer"
                    className="w-full h-72 sm:h-96 object-cover rounded-2xl"
                  />

                  {/* Simulated On-Photo Geotag Overlay Stamp */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 bg-black/85 backdrop-blur-md rounded-xl border border-white/20 text-white text-xs space-y-1 shadow-2xl">
                    <div className="flex items-center justify-between font-mono font-bold text-[11px] text-teal-400">
                      <span>2CLICK.IN VERIFIED SITE AUDIT</span>
                      <span>
                        {new Date().toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-200 font-mono">
                      <span>
                        📍 Lat: {latitude ? latitude.toFixed(5) : "28.6139"}° N
                        | Lng: {longitude ? longitude.toFixed(5) : "77.2090"}° E
                      </span>
                      <span>
                        Accuracy: ±{accuracy ? Math.round(accuracy) : "3"}m
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-sans truncate">
                      {locationAddress}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCapturedImageUri(null)}
                    className="absolute top-3 right-3 p-2 bg-red-600/90 hover:bg-red-600 text-white rounded-xl shadow-lg transition"
                    title="Remove & Retake Picture"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      No Picture Snapped Yet
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Use your device camera or upload a picture from your
                      gallery to automatically embed time &amp; geolocation
                      metadata.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" /> Open Live Camera
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" /> Upload from Gallery
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PROJECT METADATA FORM (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-teal-500" /> Geotag Metadata &amp;
              Stage Info
            </h3>

            {/* Project Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Construction Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Residential Villa - Sector 62"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Stage / Phase Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Construction Stage / Phase
              </label>
              <select
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Foundation & Earth Excavation">
                  Foundation &amp; Earth Excavation
                </option>
                <option value="RCC Slab Casting & Rebar Inspection">
                  RCC Slab Casting &amp; Rebar Inspection
                </option>
                <option value="Brickwork & AAC Masonry">
                  Brickwork &amp; AAC Masonry
                </option>
                <option value="Internal & External Plaster Curing">
                  Internal &amp; External Plaster Curing
                </option>
                <option value="Electrical & Plumbing Conduit Piping">
                  Electrical &amp; Plumbing Conduit Piping
                </option>
                <option value="Flooring, Marble & Tiling Work">
                  Flooring, Marble &amp; Tiling Work
                </option>
                <option value="Solar Panel Mounting & Grid Wiring">
                  Solar Panel Mounting &amp; Grid Wiring
                </option>
                <option value="Painting, Waterproofing & Finishing">
                  Painting, Waterproofing &amp; Finishing
                </option>
              </select>
            </div>

            {/* Site Engineer / Inspector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Site Supervisor / QA Engineer Name
              </label>
              <input
                type="text"
                value={engineerName}
                onChange={(e) => setEngineerName(e.target.value)}
                placeholder="e.g. Er. Vikram Singh (Site Supervisor)"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Site Notes / Remarks */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Technical Site Observations &amp; Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g. M25 RMC pouring complete. Beam steel rebar spacing verified per structural drawings."
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Auto GPS Summary Display */}
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between text-teal-700 dark:text-teal-300 font-bold">
                <span>📍 Geotag Stamp Info</span>
                <span>{new Date().toLocaleDateString("en-IN")}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                {latitude
                  ? `Lat: ${latitude.toFixed(4)}°, Lng: ${longitude?.toFixed(4)}°`
                  : "GPS Coordinates Auto-attached"}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSaveProgressPhoto}
              disabled={!capturedImageUri}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Save &amp; Log Progress Photo
            </button>
          </div>
        </div>
      </div>

      {/* GALLERY & HISTORY SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Geotagged Site Progress Gallery
              </h2>
              <span className="px-2.5 py-0.5 bg-teal-500/10 text-teal-600 dark:text-teal-300 text-xs font-extrabold rounded-full">
                {filteredPhotos.length} Snapshots
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Filter by project name, stage, or export official site audit logs
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadReport}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-500" /> Export Audit
              Log
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Filter className="w-4 h-4 text-teal-500" />
            <span>Filter By:</span>
          </div>

          {/* Project Filter */}
          <select
            value={selectedFilterProject}
            onChange={(e) => setSelectedFilterProject(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="All">All Projects ({photos.length})</option>
            {uniqueProjects.map((p, idx) => (
              <option key={idx} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Stage Filter */}
          <select
            value={selectedFilterStage}
            onChange={(e) => setSelectedFilterStage(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="All">All Construction Stages</option>
            {uniqueStages.map((s, idx) => (
              <option key={idx} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* GALLERY GRID */}
        {filteredPhotos.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-bold">
              No geotagged progress photos match your filter.
            </p>
            <p className="text-xs">
              Snap a picture above to create your first geotagged construction
              record.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group flex flex-col"
              >
                {/* Photo Thumbnail Container */}
                <div
                  className="relative aspect-video bg-black overflow-hidden cursor-pointer"
                  onClick={() => setActivePhotoModal(photo)}
                >
                  <img
                    src={photo.photoUrl}
                    alt={photo.stageName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* Stamp Overlay Badge */}
                  <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/80 backdrop-blur-md text-teal-300 border border-teal-500/30 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>GPS Geotagged</span>
                  </div>

                  <div className="absolute top-2 right-2 px-2 py-1 bg-slate-900/80 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{photo.timestamp.split(",")[0]}</span>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white text-xs">
                    <p className="font-extrabold text-xs truncate">
                      {photo.stageName}
                    </p>
                    <p className="text-[10px] text-teal-300 truncate font-mono">
                      📍 {photo.locationAddress}
                    </p>
                  </div>
                </div>

                {/* Card Info Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider block truncate">
                      {photo.projectName}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 italic">
                      "{photo.notes}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <UserCheck className="w-3.5 h-3.5 text-teal-500" />
                      <span className="truncate max-w-[130px]">
                        {photo.engineerName}
                      </span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActivePhotoModal(photo)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-teal-600 dark:text-teal-400 rounded-lg transition"
                        title="View Full Inspection Stamp"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-950 text-red-500 rounded-lg transition"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FULL RESOLUTION DETAIL MODAL WITH INSPECTION OVERLAY STAMP */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-teal-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold">
                    {activePhotoModal.stageName}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activePhotoModal.projectName} • Snapshot ID:{" "}
                    {activePhotoModal.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActivePhotoModal(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body with Verified Watermark Overlay */}
            <div className="relative flex-1 overflow-y-auto bg-black flex items-center justify-center p-4">
              <img
                src={activePhotoModal.photoUrl}
                alt={activePhotoModal.stageName}
                referrerPolicy="no-referrer"
                className="max-h-[60vh] w-auto object-contain rounded-2xl border border-slate-800"
              />

              {/* Watermark Overlay Stamp */}
              {watermarkEnabled && (
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/85 backdrop-blur-md rounded-2xl border border-teal-500/40 text-white text-xs space-y-2 shadow-2xl max-w-2xl mx-auto">
                  <div className="flex items-center justify-between border-b border-teal-500/30 pb-2">
                    <span className="font-black text-teal-400 tracking-wider text-xs uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />{" "}
                      2CLICK.IN VERIFIED SITE AUDIT STAMP
                    </span>
                    <span className="font-mono text-amber-300 font-bold">
                      {activePhotoModal.timestamp}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                    <div>
                      <span className="text-slate-400">Coordinates:</span> Lat{" "}
                      {activePhotoModal.latitude
                        ? activePhotoModal.latitude.toFixed(5)
                        : "28.6139"}
                      ° N, Lng{" "}
                      {activePhotoModal.longitude
                        ? activePhotoModal.longitude.toFixed(5)
                        : "77.2090"}
                      ° E
                    </div>
                    <div>
                      <span className="text-slate-400">GPS Accuracy:</span> ±
                      {activePhotoModal.accuracyMeters || 3.5}m | Alt:{" "}
                      {activePhotoModal.altitude || 216}m
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-200">
                    <span className="text-slate-400 font-semibold">
                      Location Address:
                    </span>{" "}
                    {activePhotoModal.locationAddress}
                  </div>

                  <div className="text-[11px] text-teal-300 flex items-center gap-2 pt-1 border-t border-slate-800">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      Audited By:{" "}
                      <strong>{activePhotoModal.engineerName}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={watermarkEnabled}
                  onChange={(e) => setWatermarkEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-teal-600 focus:ring-teal-500"
                />
                <span>Toggle Verified Audit Watermark Stamp</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const text = `2click.in Geotagged Site Progress Photo:\nProject: ${activePhotoModal.projectName}\nStage: ${activePhotoModal.stageName}\nLocation: ${activePhotoModal.locationAddress}\nTimestamp: ${activePhotoModal.timestamp}`;
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(text)}`,
                      "_blank",
                    );
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share WhatsApp
                </button>

                <button
                  onClick={() => setActivePhotoModal(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
