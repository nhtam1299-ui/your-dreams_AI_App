import React, { useState, useEffect } from "react";
import { Key, Sparkles, AlertCircle, CheckCircle, X, ShieldAlert } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMandatory?: boolean;
}

export default function SettingsModal({ isOpen, onClose, isMandatory = false }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3-flash-preview");
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem("uoc_mo_gemini_key") || "";
      const savedModel = localStorage.getItem("uoc_mo_gemini_model") || "gemini-3-flash-preview";
      setApiKey(savedKey);
      setSelectedModel(savedModel);
      setIsSaved(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaved(false);

    if (!apiKey.trim()) {
      setError("Vui lòng nhập API Key để sử dụng ứng dụng!");
      return;
    }

    try {
      localStorage.setItem("uoc_mo_gemini_key", apiKey.trim());
      localStorage.setItem("uoc_mo_gemini_model", selectedModel);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1000);
    } catch (err) {
      setError("Không thể lưu cấu hình. Vui lòng kiểm tra dung lượng trình duyệt!");
    }
  };

  const modelsList = [
    {
      id: "gemini-3-flash-preview",
      name: "Gemini 3 Flash",
      tag: "Default / Tiết kiệm",
      desc: "Phản hồi siêu tốc, tiết kiệm hạn ngạch tối đa. Thích hợp cho trải nghiệm thông thường.",
      color: "border-teal-200 bg-teal-50/20 text-teal-800 dark:border-teal-800 dark:text-teal-400",
      activeColor: "border-teal-600 ring-2 ring-teal-100 bg-teal-50/40"
    },
    {
      id: "gemini-3-pro-preview",
      name: "Gemini 3 Pro",
      tag: "Thông minh / Chi tiết",
      desc: "Trí tuệ vượt trội, lời văn mượt mà và phân tích hướng nghiệp có chiều sâu nhất.",
      color: "border-indigo-200 bg-indigo-50/20 text-indigo-800 dark:border-indigo-800 dark:text-indigo-400",
      activeColor: "border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/40"
    },
    {
      id: "gemini-2.5-flash",
      name: "Gemini 2.5 Flash",
      tag: "Tốc độ / Ổn định",
      desc: "Giải pháp thay thế cân bằng tốt giữa tốc độ xử lý và chất lượng hội thoại.",
      color: "border-slate-200 bg-slate-50/20 text-slate-800 dark:border-slate-800 dark:text-slate-400",
      activeColor: "border-slate-600 ring-2 ring-slate-100 bg-slate-50/40"
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in relative">
        
        {/* Close button (only if not mandatory setup) */}
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-sans font-bold text-xl sm:text-2xl text-slate-800 flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-6 h-6 text-indigo-600 animate-spin-slow" />
              Thiết lập Model & API Key
            </h3>
            <p className="text-sm text-slate-500">
              Nhập API Key cá nhân của bạn để sử dụng ứng dụng khám phá ước mơ.
            </p>
          </div>

          {/* Warning Banner if Mandatory */}
          {isMandatory && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-800">Cần có API Key để bắt đầu!</p>
                <p className="text-[11px] text-amber-700 leading-normal">
                  Chào em, ứng dụng cần sử dụng API Key Google Studio của em để kiến tạo hình vẽ và trò chuyện hướng nghiệp ảo.
                </p>
              </div>
            </div>
          )}

          {/* API Key Input Section */}
          <div className="space-y-2.5">
            <label className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-500" />
              Gemini API Key:
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none text-slate-800 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition"
            />
            <div className="text-xs text-slate-400 font-medium">
              👉 Cách lấy key: Truy cập vào trang {" "}
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 font-bold hover:underline"
              >
                Google AI Studio API Keys
              </a>
              {" "} và nhấn <strong>Create API Key</strong> để nhận key miễn phí.
            </div>
          </div>

          {/* Model Selection Section */}
          <div className="space-y-3">
            <label className="font-bold text-slate-700 text-sm">
              Chọn dòng mô hình AI sử dụng:
            </label>
            <div className="grid grid-cols-1 gap-3">
              {modelsList.map((m) => {
                const isActive = selectedModel === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-4 rounded-2xl border-2 transition duration-200 cursor-pointer select-none text-left flex items-start gap-3.5 ${
                      isActive ? m.activeColor : "border-slate-100 hover:border-slate-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={isActive}
                      onChange={() => setSelectedModel(m.id)}
                      className="mt-1 accent-indigo-600 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">{m.name}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${m.color}`}>
                          {m.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal">{m.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-100 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-pulse">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action Block */}
          <div className="pt-2 flex items-center justify-end gap-3">
            {isSaved ? (
              <div className="px-5 py-3 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-2xl border border-emerald-100 flex items-center gap-1.5 shadow-sm animate-fade-in w-full justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Lưu cấu hình thành công!
              </div>
            ) : (
              <button
                type="submit"
                className="w-full px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition active:scale-95 cursor-pointer text-sm"
              >
                Lưu Cấu Hình & Bắt Đầu
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
