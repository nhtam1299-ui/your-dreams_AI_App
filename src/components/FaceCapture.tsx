import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, RefreshCw, Check, ArrowLeft, AlertCircle, Sparkles } from "lucide-react";

interface FaceCaptureProps {
  onBack: () => void;
  onCapture: (base64Photo: string) => void;
  initialPhoto: string | null;
}

export default function FaceCapture({ onBack, onCapture, initialPhoto }: FaceCaptureProps) {
  const [mode, setMode] = useState<"choose" | "camera" | "upload" | "preview">(
    initialPhoto ? "preview" : "choose"
  );
  const [photo, setPhoto] = useState<string | null>(initialPhoto);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraLoading(true);
    try {
      if (streamRef.current) {
        stopCamera();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setMode("camera");
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        "Không thể mở được camera. Em vui lòng kiểm tra quyền truy cập camera hoặc sử dụng cách Tải ảnh lên nhé!"
      );
    } finally {
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 480;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw centered square from video
        const video = videoRef.current;
        const size = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        
        ctx.drawImage(video, sx, sy, size, size, 0, 0, 480, 480);
        const base64 = canvas.toDataURL("image/jpeg", 0.95);
        setPhoto(base64);
        setMode("preview");
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Hãy chọn một file hình ảnh (PNG, JPG, JPEG) nhé em!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        // Resize image to max 600x600 for optimal processing
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = 480;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Draw cropped square
            const scale = Math.max(size / img.width, size / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (size - w) / 2;
            const y = (size - h) / 2;
            ctx.drawImage(img, x, y, w, h);
            
            const base64 = canvas.toDataURL("image/jpeg", 0.95);
            setPhoto(base64);
            setMode("preview");
          }
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = () => {
    if (photo) {
      onCapture(photo);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100/50 space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Step Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            stopCamera();
            onBack();
          }}
          className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-slate-800 tracking-tight flex items-center gap-2">
            Bước 2: Chụp/Tải Ảnh Chân Dung
          </h2>
          <p className="text-sm text-slate-500">
            Chọn ảnh rõ mặt, cười tươi để ghép chân dung nghề nghiệp rạng rỡ nhất nhé!
          </p>
        </div>
      </div>

      {/* Mode: CHOOSE CHANNELS */}
      {mode === "choose" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <button
            onClick={startCamera}
            disabled={isCameraLoading}
            className="p-8 rounded-3xl border border-slate-100 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/30 text-center transition duration-300 flex flex-col items-center justify-center space-y-4 cursor-pointer group"
          >
            <div className="p-4 bg-indigo-600 text-white rounded-2xl group-hover:scale-110 duration-300 shadow-lg shadow-indigo-100">
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-base">Chụp trực tiếp bằng Camera</p>
              <p className="text-xs text-slate-400">Sử dụng webcam của máy tính hoặc điện thoại</p>
            </div>
          </button>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`p-8 rounded-3xl border text-center transition duration-300 flex flex-col items-center justify-center space-y-4 relative group ${
              dragActive 
                ? "border-indigo-500 bg-indigo-50/40" 
                : "border-slate-100 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/30"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="p-4 bg-emerald-600 text-white rounded-2xl group-hover:scale-110 duration-300 shadow-lg shadow-emerald-100">
              <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-base">Tải ảnh từ máy tính</p>
              <p className="text-xs text-slate-400">Hỗ trợ định dạng PNG, JPG, JPEG kéo thả</p>
            </div>
          </div>
        </div>
      )}

      {/* Mode: CAMERA STREAMING */}
      {mode === "camera" && (
        <div className="space-y-4 flex flex-col items-center">
          <div className="relative w-full max-w-[360px] aspect-square rounded-full border-4 border-indigo-600 overflow-hidden bg-slate-900 shadow-lg shadow-indigo-100">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover -scale-x-100" // mirrored for webcam familiarity
            />
            {/* Oval Face Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none border-[24px] border-slate-950/40 flex items-center justify-center">
              <div className="w-[80%] h-[85%] border-2 border-dashed border-white rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white/80 font-bold bg-slate-900/80 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Đặt khuôn mặt vào đây
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full justify-center">
            <button
              onClick={() => {
                stopCamera();
                setMode("choose");
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
            >
              Hủy
            </button>
            <button
              onClick={handleCapture}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 flex items-center space-x-2 animate-bounce-subtle"
            >
              <Camera className="w-5 h-5" />
              <span>Chụp ảnh ngay!</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode: PREVIEW & CONFIRM */}
      {mode === "preview" && photo && (
        <div className="space-y-6 flex flex-col items-center">
          <div className="relative w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden border-4 border-emerald-500 shadow-xl shadow-emerald-50">
            <img src={photo} alt="Chân dung xem trước" className="w-full h-full object-cover" />
            <div className="absolute top-2.5 right-2.5 p-1.5 bg-emerald-500 text-white rounded-full">
              <Check className="w-4 h-4 font-bold" />
            </div>
          </div>

          <div className="text-center max-w-sm space-y-1 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-50">
            <p className="font-bold text-slate-800 text-sm flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Chụp ảnh thành công!
            </p>
            <p className="text-xs text-slate-500">
              Khuôn mặt của em rất rạng rỡ. Hãy bấm "Tiếp tục" để Kiến Trúc Sư AI bắt đầu vẽ tranh nhé!
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setPhoto(null);
                setMode("choose");
              }}
              className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl border border-slate-200 flex items-center space-x-1.5 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Chụp lại</span>
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 flex items-center space-x-1.5 transition"
            >
              <Check className="w-5 h-5" />
              <span>Tiếp tục: Kiến tạo ngay!</span>
            </button>
          </div>
        </div>
      )}

      {/* Errors */}
      {cameraError && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
          <div className="flex items-start space-x-2.5 text-amber-800">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium">{cameraError}</p>
          </div>
          <button
            onClick={() => setMode("choose")}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider pl-7 block"
          >
            Quay lại chọn phương thức khác
          </button>
        </div>
      )}
    </div>
  );
}
