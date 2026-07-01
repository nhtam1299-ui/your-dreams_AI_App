import { Trash2, ExternalLink, Calendar, Compass, Award, Sparkles } from "lucide-react";
import { DreamResult } from "../types";

interface DreamGalleryProps {
  savedDreams: DreamResult[];
  onSelectDream: (dream: DreamResult) => void;
  onDeleteDream: (id: string) => void;
  onClose: () => void;
}

export default function DreamGallery({
  savedDreams,
  onSelectDream,
  onDeleteDream,
  onClose,
}: DreamGalleryProps) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto px-1 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-sans font-bold text-2xl text-slate-800 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600 animate-bounce-subtle" />
            Bảng Vàng Ước Mơ Của Lớp Mình
          </h2>
          <p className="text-sm text-slate-500">
            Nơi trưng bày những giấc mơ nghề nghiệp rạng rỡ của tất cả các em!
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition cursor-pointer"
        >
          Quay lại phòng tạo
        </button>
      </div>

      {savedDreams.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto">
          <div className="p-4 bg-indigo-50 rounded-full text-indigo-500">
            <Compass className="w-10 h-10 animate-spin-slow" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-lg">Bảng Vàng trống trải quá!</h3>
            <p className="text-sm text-slate-500">
              Hãy bắt đầu viết lên ước mơ của mình và bấm "Treo lên Bảng Vàng" để lưu giữ khoảnh khắc này nhé các em!
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-100"
          >
            Sáng tạo ước mơ ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedDreams.map((dream) => {
            const displayImg = dream.imageUrl || `https://picsum.photos/seed/${dream.careerId}/400/400`;
            return (
              <div
                key={dream.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition duration-300 flex flex-col group"
              >
                {/* Image Cover */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={displayImg}
                    alt={dream.careerName}
                    className="w-full h-full object-cover group-hover:scale-105 duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* Little face preview in corner */}
                  {dream.photoUrl && (
                    <div className="absolute top-3 left-3 w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-md">
                      <img src={dream.photoUrl} alt="Khuôn mặt" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Badge */}
                  <span className="absolute bottom-3 right-3 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow backdrop-blur-sm">
                    {dream.careerName}
                  </span>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                        {dream.name}
                        <span className="text-xs font-medium text-slate-400">
                          ({dream.gender})
                        </span>
                      </h4>
                      <div className="flex items-center text-[10px] text-slate-400 font-medium">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {new Date(dream.timestamp).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {dream.greeting}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 border-t border-slate-50 pt-3">
                    <button
                      onClick={() => onSelectDream(dream)}
                      className="flex-1 px-4 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center space-x-1 transition cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem & Sửa Ảnh</span>
                    </button>

                    <button
                      onClick={() => onDeleteDream(dream.id)}
                      className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 rounded-xl transition cursor-pointer"
                      title="Gỡ khỏi Bảng Vàng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
