import { useState, useEffect } from "react";
import { Sparkles, Compass, Rocket, Stethoscope, RefreshCw, MessageSquare, HelpCircle, Heart, Star, BookOpen, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import Header from "./components/Header";
import DreamForm from "./components/DreamForm";
import FaceCapture from "./components/FaceCapture";
import DreamCardResult from "./components/DreamCardResult";
import ArchitectChat from "./components/ArchitectChat";
import DreamGallery from "./components/DreamGallery";
import { DreamState, DreamResult } from "./types";
import Confetti from "./components/Confetti";
import SettingsModal from "./components/SettingsModal";



export default function App() {
  const [step, setStep] = useState<"form" | "capture" | "generating" | "result">("form");
  const [showGallery, setShowGallery] = useState(false);
  const [formData, setFormData] = useState<DreamState>({
    name: "",
    careerId: "",
    customCareer: "",
    gender: "Nam",
    photoUrl: null,
  });
  const [activeResult, setActiveResult] = useState<DreamResult | null>(null);
  const [savedDreams, setSavedDreams] = useState<DreamResult[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loadingText, setLoadingText] = useState("Đang liên hệ Kiến Trúc Sư...");

  // Settings & key modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMandatoryOpen, setIsMandatoryOpen] = useState(false);

  interface StepProgress {
    status: "pending" | "processing" | "success" | "error";
    modelUsed?: string;
    errorMessage?: string;
  }

  const [progress, setProgress] = useState<{
    text: StepProgress;
    image: StepProgress;
    quiz: StepProgress;
  }>({
    text: { status: "pending" },
    image: { status: "pending" },
    quiz: { status: "pending" },
  });

  // Verify key presence on mount
  useEffect(() => {
    const key = localStorage.getItem("uoc_mo_gemini_key");
    if (!key || key.trim() === "") {
      setIsMandatoryOpen(true);
    }
  }, []);

  // Loading quotes cycle during generation
  const loadingStages = [
    "Đang gõ cửa Văn phòng Kiến Trúc Sư Ước Mơ...",
    "Đang chuẩn bị bối cảnh làm việc tương lai cho em...",
    "Đang đo may trang phục bảo hộ chuyên nghiệp phù hợp...",
    "Đang căn chỉnh ánh sáng phòng lab và studio hiện đại...",
    "Đang thiết kế gương mặt rạng rỡ đầy tự tin...",
    "Đang viết những lời chúc và động lực học tập gửi riêng cho em...",
  ];


  // Load saved dreams on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("uoc_mo_saved_dreams");
      if (saved) {
        setSavedDreams(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Error reading saved dreams from localStorage:", err);
    }
  }, []);

  // Save changes to localStorage helper
  const saveToLocalStorage = (newDreams: DreamResult[]) => {
    try {
      localStorage.setItem("uoc_mo_saved_dreams", JSON.stringify(newDreams));
      setSavedDreams(newDreams);
    } catch (err) {
      console.error("Error writing saved dreams to localStorage:", err);
    }
  };

  // Cycle loading status text
  useEffect(() => {
    if (step === "generating") {
      let stageIdx = 0;
      setLoadingText(loadingStages[0]);
      
      const interval = setInterval(() => {
        stageIdx = (stageIdx + 1) % loadingStages.length;
        setLoadingText(loadingStages[stageIdx]);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [step]);

  // Handle Step 1 form submission
  const handleFormSubmit = (data: { name: string; gender: "Nam" | "Nữ"; careerId: string; customCareer: string }) => {
    setFormData((prev) => ({
      ...prev,
      name: data.name,
      gender: data.gender,
      careerId: data.careerId,
      customCareer: data.customCareer,
    }));
    setStep("capture");
  };

  // Handle Step 2 photo capture
  const handlePhotoCapture = (base64Photo: string) => {
    setFormData((prev) => ({ ...prev, photoUrl: base64Photo }));
    triggerGeneration(base64Photo);
  };

  // Step 3: Call full-stack endpoints with fallback retry model support
  const triggerGeneration = async (capturedPhoto: string) => {
    setStep("generating");
    
    // Reset progress states
    setProgress({
      text: { status: "pending" },
      image: { status: "pending" },
      quiz: { status: "pending" },
    });

    const apiKey = localStorage.getItem("uoc_mo_gemini_key") || "";
    const chosenModel = localStorage.getItem("uoc_mo_gemini_model") || "gemini-3-flash-preview";

    // Fallback models sequence: selected model first, then the remaining ones
    const modelsList = [
      chosenModel,
      ...["gemini-3-flash-preview", "gemini-3-pro-preview", "gemini-2.5-flash"].filter(m => m !== chosenModel)
    ];

    let generatedTextData: any = null;
    let generatedImageData: any = null;

    // --- STEP 1: Text Generation ---
    setProgress(p => ({ ...p, text: { status: "processing", modelUsed: chosenModel } }));
    
    let textSuccess = false;
    let textError = "";
    for (const model of modelsList) {
      try {
        setProgress(p => ({ ...p, text: { status: "processing", modelUsed: model } }));
        const response = await fetch("/api/dream/text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "x-gemini-model": model
          },
          body: JSON.stringify({
            name: formData.name,
            careerId: formData.careerId,
            customCareer: formData.customCareer,
            gender: formData.gender,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          generatedTextData = data;
          textSuccess = true;
          setProgress(p => ({ ...p, text: { status: "success", modelUsed: model } }));
          break;
        } else {
          throw new Error(data.error || `HTTP ${response.status}`);
        }
      } catch (err: any) {
        console.warn(`Step 1 (Text) failed with model ${model}:`, err);
        textError = err.message || "Lỗi không xác định";
      }
    }

    if (!textSuccess) {
      setProgress(p => ({ 
        ...p, 
        text: { status: "error", errorMessage: textError },
        image: { status: "error", errorMessage: "Đã dừng do lỗi ở bước trước" },
        quiz: { status: "error", errorMessage: "Đã dừng do lỗi ở bước trước" }
      }));
      // Alert and wait to let user see
      setTimeout(() => setStep("capture"), 5000);
      return;
    }

    // --- STEP 2: Image Generation ---
    setProgress(p => ({ ...p, image: { status: "processing", modelUsed: "gemini-3.1-flash-lite-image" } }));
    
    let imageSuccess = false;
    try {
      const response = await fetch("/api/dream/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({
          aiPrompt: generatedTextData.aiPrompt,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        generatedImageData = data;
        imageSuccess = true;
        setProgress(p => ({ ...p, image: { status: "success", modelUsed: "gemini-3.1-flash-lite-image" } }));
      } else {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
    } catch (err: any) {
      console.warn("Step 2 (Image) failed, using fallback:", err);
      generatedImageData = { imageUrl: null };
      imageSuccess = true;
      setProgress(p => ({ ...p, image: { status: "success", modelUsed: "fallback" } }));
    }

    // --- STEP 3: Quiz Generation ---
    setProgress(p => ({ ...p, quiz: { status: "processing", modelUsed: chosenModel } }));
    
    let quizSuccess = false;
    let quizError = "";
    let generatedQuizData = null;
    for (const model of modelsList) {
      try {
        setProgress(p => ({ ...p, quiz: { status: "processing", modelUsed: model } }));
        const response = await fetch("/api/quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "x-gemini-model": model
          },
          body: JSON.stringify({
            careerName: generatedTextData.careerName,
            studentName: formData.name,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          generatedQuizData = data;
          quizSuccess = true;
          setProgress(p => ({ ...p, quiz: { status: "success", modelUsed: model } }));
          break;
        } else {
          throw new Error(data.error || `HTTP ${response.status}`);
        }
      } catch (err: any) {
        console.warn(`Step 3 (Quiz) failed with model ${model}:`, err);
        quizError = err.message || "Lỗi không xác định";
      }
    }

    if (!quizSuccess) {
      setProgress(p => ({ 
        ...p, 
        quiz: { status: "error", errorMessage: quizError }
      }));
      setTimeout(() => setStep("capture"), 5000);
      return;
    }

    // Success! Build full result state
    const newResult: DreamResult = {
      id: "dream_" + Math.random().toString(36).substr(2, 9),
      name: formData.name,
      careerId: formData.careerId,
      careerName: generatedTextData.careerName,
      gender: formData.gender,
      greeting: generatedTextData.greeting,
      aiPrompt: generatedTextData.aiPrompt,
      inspiration: generatedTextData.inspiration,
      statusText: `Status: Ready for Face-swap | Target_Career: ${generatedTextData.careerName} | Gender: ${formData.gender}`,
      imageUrl: generatedImageData.imageUrl,
      photoUrl: capturedPhoto,
      timestamp: new Date().toISOString(),
    };

    // Store pre-generated quiz in local storage
    localStorage.setItem(`quiz_${newResult.id}`, JSON.stringify(generatedQuizData));

    setActiveResult(newResult);
    setStep("result");
    setIsChatOpen(false);
  };


  // Save current active result to Bảng Vàng
  const handleSaveToGallery = () => {
    if (!activeResult) return;

    // Check if already exists
    const exists = savedDreams.some((d) => d.id === activeResult.id);
    if (exists) {
      alert("Ước mơ này của em đã được lưu trên Bảng Vàng rồi nhé!");
      return;
    }

    const updated = [activeResult, ...savedDreams];
    saveToLocalStorage(updated);
  };

  // Delete saved dream card
  const handleDeleteDream = (id: string) => {
    const updated = savedDreams.filter((d) => d.id !== id);
    saveToLocalStorage(updated);
    
    if (activeResult?.id === id) {
      setActiveResult(null);
      setStep("form");
    }
  };

  // Load a dream card from gallery
  const handleSelectDream = (dream: DreamResult) => {
    setActiveResult(dream);
    setFormData({
      name: dream.name,
      careerId: dream.careerId,
      customCareer: dream.careerId === "custom" ? dream.careerName : "",
      gender: dream.gender,
      photoUrl: dream.photoUrl,
    });
    setStep("result");
    setShowGallery(false);
  };

  const handleRestart = () => {
    setFormData({
      name: "",
      careerId: "",
      customCareer: "",
      gender: "Nam",
      photoUrl: null,
    });
    setActiveResult(null);
    setStep("form");
    setIsChatOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header component */}
      <Header
        onShowGallery={() => setShowGallery(!showGallery)}
        showGallery={showGallery}
        savedCount={savedDreams.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main body canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-12">
        
        {/* Gallery View Overlay */}
        {showGallery ? (
          <DreamGallery
            savedDreams={savedDreams}
            onSelectDream={handleSelectDream}
            onDeleteDream={handleDeleteDream}
            onClose={() => setShowGallery(false)}
          />
        ) : (
          <div className="space-y-8">
            {/* Introductory Hero (only on Step 1) */}
            {step === "form" && (
              <div className="text-center max-w-2xl mx-auto space-y-4 py-4 animate-fade-in">
                <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100/50 px-3.5 py-1.5 rounded-full text-xs font-bold text-indigo-700 uppercase tracking-wider shadow-sm shadow-indigo-50/50">
                  <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>Ứng dụng giáo dục định hướng nghề nghiệp</span>
                </div>
                <h2 className="font-sans font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-none">
                  Khám Phá <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">Ước Mơ</span> Của Em!
                </h2>
                <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto font-sans leading-relaxed">
                  Nhận chân dung công việc tương lai và trò chuyện định hướng học tập cùng trợ lý ảo <strong>Kiến Trúc Sư Ước Mơ AI</strong>.
                </p>
              </div>
            )}

            {/* Step Content routing */}
            {step === "form" && (
              <DreamForm
                onSubmit={handleFormSubmit}
                initialData={{
                  name: formData.name,
                  gender: formData.gender,
                  careerId: formData.careerId,
                  customCareer: formData.customCareer,
                }}
              />
            )}

            {step === "capture" && (
              <FaceCapture
                onBack={() => setStep("form")}
                onCapture={handlePhotoCapture}
                initialPhoto={formData.photoUrl}
              />
            )}

            {/* Step 3: AI Processing Loader with Step Progress Columns */}
            {step === "generating" && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col space-y-6 max-w-xl mx-auto animate-fade-in">
                <div className="text-center space-y-2">
                  <div className="relative inline-block mx-auto mb-2">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                      <Rocket className="w-7 h-7 animate-bounce-subtle" />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">Đang tiến hành kiến tạo tương lai...</h3>
                  <p className="text-xs text-slate-400 italic">
                    🚀 {loadingText}
                  </p>
                </div>

                {/* Progress Steps / Columns */}
                <div className="space-y-3.5">
                  {/* Step 1 */}
                  {(() => {
                    const { status, modelUsed, errorMessage } = progress.text;
                    let icon = <div className="w-5 h-5 rounded-full border-2 border-slate-200" />;
                    let text = "Đang chờ...";
                    let color = "text-slate-400";
                    let bg = "bg-slate-50/50 border-slate-100";
                    if (status === "processing") {
                      icon = <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />;
                      text = modelUsed ? `Đang khởi tạo bằng ${modelUsed}...` : "Đang khởi tạo...";
                      color = "text-indigo-600 font-medium";
                      bg = "bg-indigo-50/10 border-indigo-100/80 animate-pulse-slow";
                    } else if (status === "success") {
                      icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />;
                      text = `Hoàn tất (${modelUsed})`;
                      color = "text-emerald-700 font-bold";
                      bg = "bg-emerald-50/20 border-emerald-100/50";
                    } else if (status === "error") {
                      icon = <XCircle className="w-5 h-5 text-rose-600" />;
                      text = errorMessage ? `Thất bại: ${errorMessage}` : "Lỗi khởi tạo";
                      color = "text-rose-700 font-bold";
                      bg = "bg-rose-50/30 border-rose-100";
                    }
                    return (
                      <div className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all duration-300 ${bg}`}>
                        <div className="mt-0.5">{icon}</div>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-800 text-sm">Bước 1: Khởi tạo Lộ trình Hướng nghiệp</h4>
                          <p className={`text-xs ${color}`}>{text}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Step 2 */}
                  {(() => {
                    const { status, modelUsed, errorMessage } = progress.image;
                    let icon = <div className="w-5 h-5 rounded-full border-2 border-slate-200" />;
                    let text = "Đang chờ...";
                    let color = "text-slate-400";
                    let bg = "bg-slate-50/50 border-slate-100";
                    if (status === "processing") {
                      icon = <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />;
                      text = "Đang vẽ chân dung tương lai...";
                      color = "text-indigo-600 font-medium";
                      bg = "bg-indigo-50/10 border-indigo-100/80 animate-pulse-slow";
                    } else if (status === "success") {
                      icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />;
                      text = "Hoàn tất vẽ chân dung";
                      color = "text-emerald-700 font-bold";
                      bg = "bg-emerald-50/20 border-emerald-100/50";
                    } else if (status === "error") {
                      icon = <XCircle className="w-5 h-5 text-rose-600" />;
                      text = `Thất bại: ${errorMessage}`;
                      color = "text-rose-700 font-bold";
                      bg = "bg-rose-50/30 border-rose-100";
                    }
                    return (
                      <div className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all duration-300 ${bg}`}>
                        <div className="mt-0.5">{icon}</div>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-800 text-sm">Bước 2: Vẽ Chân dung Nghề nghiệp</h4>
                          <p className={`text-xs ${color}`}>{text}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Step 3 */}
                  {(() => {
                    const { status, modelUsed, errorMessage } = progress.quiz;
                    let icon = <div className="w-5 h-5 rounded-full border-2 border-slate-200" />;
                    let text = "Đang chờ...";
                    let color = "text-slate-400";
                    let bg = "bg-slate-50/50 border-slate-100";
                    if (status === "processing") {
                      icon = <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />;
                      text = modelUsed ? `Đang soạn trắc nghiệm bằng ${modelUsed}...` : "Đang soạn trắc nghiệm...";
                      color = "text-indigo-600 font-medium";
                      bg = "bg-indigo-50/10 border-indigo-100/80 animate-pulse-slow";
                    } else if (status === "success") {
                      icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />;
                      text = `Hoàn tất soạn câu hỏi (${modelUsed})`;
                      color = "text-emerald-700 font-bold";
                      bg = "bg-emerald-50/20 border-emerald-100/50";
                    } else if (status === "error") {
                      icon = <XCircle className="w-5 h-5 text-rose-600" />;
                      text = `Thất bại: ${errorMessage}`;
                      color = "text-rose-700 font-bold";
                      bg = "bg-rose-50/30 border-rose-100";
                    }
                    return (
                      <div className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all duration-300 ${bg}`}>
                        <div className="mt-0.5">{icon}</div>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-800 text-sm">Bước 3: Thiết kế Thử thách Trắc nghiệm</h4>
                          <p className={`text-xs ${color}`}>{text}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Step 4: Outcome & Customization */}
            {step === "result" && activeResult && (
              <div className="space-y-8 animate-fade-in">
                <Confetti />
                <DreamCardResult
                  result={activeResult}
                  onSaveToGallery={handleSaveToGallery}
                  onRestart={handleRestart}
                  isSaved={savedDreams.some((d) => d.id === activeResult.id)}
                  onOpenChat={() => setIsChatOpen(!isChatOpen)}
                />

                {/* Collapsible interactive side/bottom chat */}
                {isChatOpen && (
                  <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-500 animate-bounce" /> Trò chuyện học tập định hướng
                      </p>
                      <button
                        onClick={() => setIsChatOpen(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 font-bold uppercase cursor-pointer"
                      >
                        Đóng khung chat
                      </button>
                    </div>
                    <ArchitectChat
                      name={activeResult.name}
                      careerName={activeResult.careerName}
                      gender={activeResult.gender}
                      onClose={() => setIsChatOpen(false)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Settings Modal (Standard & Mandatory) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <SettingsModal
        isOpen={isMandatoryOpen}
        onClose={() => setIsMandatoryOpen(false)}
        isMandatory={true}
      />

      {/* Humble Footer */}
      <footer className="py-6 border-t border-slate-100 bg-white text-center text-xs text-slate-400 font-sans mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Ước Mơ Của Em - Đồng Hành Cùng Em Khám Phá Tương Lai</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Sáng tạo & Giáo dục</span>
            <span>•</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Tri thức kiến tạo tương lai</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

