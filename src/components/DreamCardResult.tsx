import React, { useState, useRef, useEffect } from "react";
import { Download, Share2, Award, RefreshCw, MessageSquare, Compass, Sparkles, Scale, Maximize2, Move } from "lucide-react";
import { DreamResult } from "../types";
import CareerQuiz from "./CareerQuiz";


interface DreamCardResultProps {
  result: DreamResult;
  onSaveToGallery: () => void;
  onRestart: () => void;
  isSaved: boolean;
  onOpenChat: () => void;
}

export default function DreamCardResult({
  result,
  onSaveToGallery,
  onRestart,
  isSaved,
  onOpenChat,
}: DreamCardResultProps) {
  const [faceX, setFaceX] = useState(150);
  const [faceY, setFaceY] = useState(80);
  const [faceScale, setFaceScale] = useState(1.0);
  const [faceRotate, setFaceRotate] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const facePosStartRef = useRef({ x: 0, y: 0 });
  const rotateStartRef = useRef(0);
  const angleStartRef = useRef(0);

  // Fallback image if Gemini did not generate an image (unpaid model or missing API key)
  // We use standard placeholder or beautifully simulated colored gradients matching the career
  const displayImageUrl = result.imageUrl || `https://picsum.photos/seed/${result.careerId}/800/800`;

  // Handle Dragging of the user's face
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: clientX, y: clientY };
    facePosStartRef.current = { x: faceX, y: faceY };
  };

  // Handle Rotation and Scaling of the face
  const handleRotateStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRotating(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    // Calculate angle from face center
    const faceCenter = { x: faceX + 50, y: faceY + 60 }; // approximately half width & height
    const container = containerRef.current?.getBoundingClientRect();
    if (container) {
      const faceCenterClient = {
        x: container.left + faceCenter.x,
        y: container.top + faceCenter.y,
      };
      angleStartRef.current = Math.atan2(clientY - faceCenterClient.y, clientX - faceCenterClient.x);
      rotateStartRef.current = faceRotate;
    }
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const dx = clientX - dragStartRef.current.x;
        const dy = clientY - dragStartRef.current.y;
        setFaceX(Math.max(-50, Math.min(350, facePosStartRef.current.x + dx)));
        setFaceY(Math.max(-50, Math.min(350, facePosStartRef.current.y + dy)));
      }

      if (isRotating) {
        const faceCenter = { x: faceX + 50, y: faceY + 60 };
        const container = containerRef.current?.getBoundingClientRect();
        if (container) {
          const faceCenterClient = {
            x: container.left + faceCenter.x,
            y: container.top + faceCenter.y,
          };
          const currentAngle = Math.atan2(clientY - faceCenterClient.y, clientX - faceCenterClient.x);
          const angleDiff = currentAngle - angleStartRef.current;
          setFaceRotate((rotateStartRef.current + angleDiff * (180 / Math.PI)) % 360);
        }
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setIsRotating(false);
    };

    if (isDragging || isRotating) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, isRotating, faceX, faceY, faceRotate]);

  // Download high quality composite image
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw background career image
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.src = displayImageUrl;
      await new Promise((resolve) => {
        bgImg.onload = resolve;
        bgImg.onerror = resolve; // proceed anyway
      });

      ctx.drawImage(bgImg, 0, 0, 800, 800);

      // Draw cropped user face if available
      if (result.photoUrl) {
        const faceImg = new Image();
        faceImg.src = result.photoUrl;
        await new Promise((resolve) => {
          faceImg.onload = resolve;
          faceImg.onerror = resolve;
        });

        // Compute positioning on 800x800 canvas scale
        // container width is 400px, so we scale coordinates by 2.
        const scaleFactor = 2;
        const canvasFaceX = faceX * scaleFactor;
        const canvasFaceY = faceY * scaleFactor;
        const faceWidth = 100 * faceScale * scaleFactor;
        const faceHeight = 120 * faceScale * scaleFactor;

        ctx.save();
        // Move to face center
        ctx.translate(canvasFaceX + faceWidth / 2, canvasFaceY + faceHeight / 2);
        ctx.rotate((faceRotate * Math.PI) / 180);

        // Clip face into oval
        ctx.beginPath();
        ctx.ellipse(0, 0, faceWidth / 2, faceHeight / 2, 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw image centered in clip
        ctx.drawImage(faceImg, -faceWidth / 2, -faceHeight / 2, faceWidth, faceHeight);
        ctx.restore();
      }

      // Render custom text at bottom of the downloaded card
      ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
      ctx.fillRect(0, 720, 800, 800);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(`${result.name} - ${result.careerName} Tương Lai`, 40, 765);

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "14px monospace";
      ctx.fillText(`Uoc Mo Cua Em AI Portrait`, 600, 765);

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `uoc_mo_${result.name.replace(/\s+/g, "_")}_${result.careerId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100/50 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
      
      {/* Visual Composition Editor (12 columns: lg:5) */}
      <div className="lg:col-span-5 flex flex-col items-center space-y-4">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-center flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-600" /> Chân dung tương lai của em
        </h3>

        {/* Interactive Editor Frame */}
        <div 
          ref={containerRef}
          className="relative w-full max-w-[400px] aspect-square rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 shadow-md select-none touch-none"
        >
          {/* Main Background (Gemini Career Image) */}
          <img 
            src={displayImageUrl} 
            alt={result.careerName} 
            className="w-full h-full object-cover pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Draggable user face overlay if they uploaded one */}
          {result.photoUrl && (
            <div
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              style={{
                position: "absolute",
                left: `${faceX}px`,
                top: `${faceY}px`,
                width: `${100 * faceScale}px`,
                height: `${120 * faceScale}px`,
                transform: `rotate(${faceRotate}deg)`,
                cursor: isDragging ? "grabbing" : "grab",
              }}
              className="group border-2 border-dashed border-indigo-400 hover:border-indigo-600 rounded-full flex items-center justify-center animate-pulse-slow shadow-lg"
            >
              {/* Profile Image Oval Mask */}
              <div className="w-full h-full overflow-hidden rounded-full border border-white">
                <img 
                  src={result.photoUrl} 
                  alt="Khuôn mặt" 
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>

              {/* Resize Handle at Bottom-Right */}
              <div
                onMouseDown={handleRotateStart}
                onTouchStart={handleRotateStart}
                className="absolute -bottom-2 -right-2 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md cursor-nesw-resize transition"
                title="Xoay và điều chỉnh"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </div>

              {/* Help tip inside face frame */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-indigo-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Kéo di chuyển | Xoay ở góc
              </div>
            </div>
          )}

          {/* Beautiful glowing decorative overlay at bottom of picture */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent p-4 flex justify-between items-end">
            <span className="text-white font-bold text-sm tracking-wide bg-indigo-600/80 px-2.5 py-1 rounded-lg backdrop-blur-sm">
              {result.name}
            </span>
            <span className="text-white/90 text-xs font-semibold">
              ✨ Tương lai rạng rỡ
            </span>
          </div>
        </div>

        {/* Visual Tuning Guides */}
        {result.photoUrl && (
          <div className="w-full max-w-[400px] p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1"><Scale className="w-3.5 h-3.5 text-indigo-500" /> Kích cỡ mặt:</span>
              <span className="font-bold text-slate-800">{Math.round(faceScale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={faceScale}
              onChange={(e) => setFaceScale(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-[10px] text-slate-400 text-center font-medium">
              👉 Em kéo khuôn mặt vào đúng vị trí cổ, sau đó kéo thanh trượt để chỉnh khuôn mặt vừa khít nhé!
            </p>
          </div>
        )}

        {/* Status display exactly matching spec */}
        <div className="w-full text-center bg-indigo-950 text-indigo-200 px-4 py-2.5 rounded-xl font-mono text-xs border border-indigo-900 shadow-inner">
          {result.statusText}
        </div>
      </div>

      {/* Narrative & Motivation Panel (lg:7) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Sparkly Greeting Section */}
        <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 rounded-3xl border border-indigo-100/50 space-y-3 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-16 h-16 bg-indigo-200/20 rounded-full blur-2xl"></div>
          <h4 className="font-bold text-indigo-800 text-lg flex items-center gap-2">
            💼 Kiến Trúc Sư Ước Mơ nhắn nhủ
          </h4>
          <p className="text-slate-700 leading-relaxed font-medium text-base">
            {result.greeting}
          </p>
        </div>

        {/* Inspirations & Quotes */}
        <div className="p-5 bg-emerald-50/30 rounded-3xl border border-emerald-100/50 space-y-2.5">
          <h4 className="font-bold text-emerald-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
            🏆 Sứ mệnh & Động lực học tập
          </h4>
          <p className="text-slate-600 italic leading-relaxed text-sm">
            "{result.inspiration}"
          </p>
        </div>

        {/* Image Generation Details (Prompt) */}
        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-1.5">
          <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
            🎨 Mô tả kịch bản hình ảnh (AI Prompt):
          </h5>
          <p className="text-xs text-slate-400 font-mono italic leading-normal select-all">
            {result.aiPrompt}
          </p>
        </div>

        {/* Career Quiz Minigame */}
        <CareerQuiz careerName={result.careerName} studentName={result.name} dreamId={result.id} />



        {/* Interaction Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <Download className={`w-5 h-5 ${isDownloading ? "animate-spin" : ""}`} />
            <span>{isDownloading ? "Đang chuẩn bị ảnh..." : "Tải ảnh kỉ niệm xuống"}</span>
          </button>

          <button
            onClick={onSaveToGallery}
            className={`flex-1 px-6 py-3 font-bold rounded-2xl shadow-md border transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer ${
              isSaved
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-50"
                : "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-indigo-50"
            }`}
          >
            <Award className="w-5 h-5" />
            <span>{isSaved ? "Đã treo Bảng Vàng ✨" : "Treo lên Bảng Vàng"}</span>
          </button>
        </div>

        {/* Secondary Navigation Options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onOpenChat}
            className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
          >
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span>Hỏi đáp cùng Kiến Trúc Sư AI</span>
          </button>

          <button
            onClick={onRestart}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Ước mơ mới!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
