import React, { useState } from "react";
import { 
  Stethoscope, Rocket, GraduationCap, Code2, Cpu, 
  Utensils, Palette, Plane, FlaskConical, ShieldAlert, 
  User, Sparkles, Compass
} from "lucide-react";
import { careers } from "../careers";
import { CareerOption } from "../types";

interface DreamFormProps {
  onSubmit: (data: { name: string; gender: "Nam" | "Nữ"; careerId: string; customCareer: string }) => void;
  initialData: { name: string; gender: "Nam" | "Nữ"; careerId: string; customCareer: string };
}

// Map icon string names to dynamic React components from lucide-react
export function renderCareerIcon(iconName: string, className = "w-5 h-5") {
  switch (iconName) {
    case "Stethoscope": return <Stethoscope className={className} />;
    case "Rocket": return <Rocket className={className} />;
    case "GraduationCap": return <GraduationCap className={className} />;
    case "Code2": return <Code2 className={className} />;
    case "Cpu": return <Cpu className={className} />;
    case "Utensils": return <Utensils className={className} />;
    case "Palette": return <Palette className={className} />;
    case "Plane": return <Plane className={className} />;
    case "FlaskConical": return <FlaskConical className={className} />;
    case "ShieldAlert": return <ShieldAlert className={className} />;
    default: return <Compass className={className} />;
  }
}

export default function DreamForm({ onSubmit, initialData }: DreamFormProps) {
  const [name, setName] = useState(initialData.name);
  const [gender, setGender] = useState<"Nam" | "Nữ">(initialData.gender);
  const [selectedId, setSelectedId] = useState(initialData.careerId || careers[0].id);
  const [customCareer, setCustomCareer] = useState(initialData.customCareer);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Em hãy nhập tên của mình nhé!");
      return;
    }
    if (selectedId === "custom" && !customCareer.trim()) {
      setError("Em hãy nhập ước mơ nghề nghiệp của mình nhé!");
      return;
    }

    onSubmit({
      name: name.trim(),
      gender,
      careerId: selectedId,
      customCareer: selectedId === "custom" ? customCareer.trim() : "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100/50 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="space-y-2">
        <h2 className="font-sans font-bold text-xl sm:text-2xl text-slate-800 tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 animate-spin" />
          Bước 1: Chia Sẻ Ước Mơ Của Em
        </h2>
        <p className="text-sm text-slate-500">
          Hãy nhập tên, chọn giới tính và ước mơ nghề nghiệp của em để AI bắt đầu kiến tạo nhé!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Tên của em là gì?</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Hoàng Nam, Khánh Linh..."
              maxLength={40}
              className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-slate-800 font-medium transition-all"
            />
            <div className="absolute right-3.5 top-3.5 text-slate-400">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Gender Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Chọn giới tính (để AI tạo hình phù hợp nhé!)</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setGender("Nam")}
              className={`py-3 rounded-xl font-medium border transition-all flex items-center justify-center space-x-2 ${
                gender === "Nam"
                  ? "bg-blue-50 text-blue-700 border-blue-200 ring-4 ring-blue-50"
                  : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>🧑 Nam</span>
            </button>
            <button
              type="button"
              onClick={() => setGender("Nữ")}
              className={`py-3 rounded-xl font-medium border transition-all flex items-center justify-center space-x-2 ${
                gender === "Nữ"
                  ? "bg-pink-50 text-pink-700 border-pink-200 ring-4 ring-pink-50"
                  : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>👧 Nữ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Career Selection Grid */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">Ước mơ tương lai của em là trở thành gì?</label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {careers.map((career) => (
            <button
              key={career.id}
              type="button"
              onClick={() => setSelectedId(career.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-start space-x-3 cursor-pointer group ${
                selectedId === career.id
                  ? `bg-indigo-50/70 border-indigo-400 ring-4 ring-indigo-50`
                  : `${career.gradient} border-slate-100`
              }`}
            >
              <div className={`p-2.5 rounded-xl transition-colors ${
                selectedId === career.id 
                  ? "bg-indigo-600 text-white" 
                  : `bg-white ${career.textColor} shadow-sm group-hover:scale-110 duration-300`
              }`}>
                {renderCareerIcon(career.icon)}
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                  {career.name}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {career.description}
                </p>
              </div>
            </button>
          ))}

          {/* Custom Career Option */}
          <button
            type="button"
            onClick={() => setSelectedId("custom")}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-start space-x-3 cursor-pointer group ${
              selectedId === "custom"
                ? "bg-indigo-50/70 border-indigo-400 ring-4 ring-indigo-50"
                : "bg-slate-50/30 hover:bg-slate-100 border-slate-200"
            }`}
          >
            <div className={`p-2.5 rounded-xl transition-colors ${
              selectedId === "custom" ? "bg-indigo-600 text-white" : "bg-white text-slate-500 shadow-sm"
            }`}>
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-sm">Ước mơ khác...</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tự viết ước mơ bay xa khác của riêng em!
              </p>
            </div>
          </button>
        </div>

        {/* Custom Career Input */}
        {selectedId === "custom" && (
          <div className="mt-4 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100 space-y-2 animate-fade-in">
            <label className="block text-xs font-bold text-indigo-800 uppercase tracking-wider">
              Nhập ước mơ nghề nghiệp của em:
            </label>
            <input
              type="text"
              value={customCareer}
              onChange={(e) => setCustomCareer(e.target.value)}
              placeholder="Ví dụ: Nhà thiết kế game, Ca sĩ, Giáo sư vật lý..."
              maxLength={50}
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-slate-800 font-medium transition-all"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
          ⚠️ {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transform active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>Tiếp theo: Chụp ảnh chân dung</span>
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
