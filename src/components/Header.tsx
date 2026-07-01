import { Sparkles, Award, Settings, ExternalLink } from "lucide-react";

interface HeaderProps {
  onShowGallery: () => void;
  showGallery: boolean;
  savedCount: number;
  onOpenSettings: () => void;
}

export default function Header({ onShowGallery, showGallery, savedCount, onOpenSettings }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* App Title */}
        <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => window.location.reload()}>
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-base sm:text-lg lg:text-xl tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
              Ước Mơ Của Em
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold border border-indigo-100 hidden sm:inline-block">
                AI Kiến Tạo
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-sans hidden sm:block mt-1">
              Đồng hành cùng học sinh kiến tạo chân dung tương lai
            </p>
          </div>
        </div>

        {/* Header Options */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Settings API Key Guide */}
          <div className="flex flex-col items-end text-right">
            <a 
              href="https://aistudio.google.com/api-keys" 
              target="_blank" 
              rel="noreferrer" 
              className="text-[9px] sm:text-xs text-rose-600 hover:text-rose-800 font-extrabold flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 animate-pulse-slow"
            >
              <span>Lấy API key để sử dụng app</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shadow-sm"
            title="Cài đặt AI"
          >
            <Settings className="w-4 h-4 animate-spin-slow" />
            <span className="hidden md:inline">Cài đặt</span>
          </button>

          {/* Gallery Button */}
          <button
            onClick={onShowGallery}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
              showGallery
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Bảng Vàng</span>
            {savedCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

