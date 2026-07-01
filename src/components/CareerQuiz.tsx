import React, { useState } from "react";
import { Gamepad2, CheckCircle2, XCircle, Award, RefreshCw, ArrowRight, Star, HelpCircle, Loader2 } from "lucide-react";
import { QuizQuestion } from "../types";

interface CareerQuizProps {
  careerName: string;
  studentName: string;
  dreamId: string;
}

export default function CareerQuiz({ careerName, studentName, dreamId }: CareerQuizProps) {
  const [gameState, setGameState] = useState<"intro" | "loading" | "quiz" | "summary">("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Check for preloaded questions on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(`quiz_${dreamId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          setQuestions(parsed.questions);
          setGameState("quiz");
        }
      }
    } catch (err) {
      console.error("Error loading preloaded quiz:", err);
    }
  }, [dreamId]);

  // Fetch quiz questions from server

  const startQuiz = async () => {
    setGameState("loading");
    setError(null);
    setSelectedIdx(null);
    setCurrentIdx(0);
    setScore(0);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerName, studentName }),
      });
      const data = await response.json();
      if (response.ok && data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setGameState("quiz");
      } else {
        throw new Error(data.error || "Không thể tải được bộ câu hỏi");
      }
    } catch (err: any) {
      console.error("Quiz fetch error:", err);
      setError("Hệ thống bận một chút, em vui lòng bấm thử lại nhé!");
      setGameState("intro");
    }
  };

  const handleAnswerSelect = (optionIdx: number) => {
    if (selectedIdx !== null) return; // locked
    setSelectedIdx(optionIdx);
    if (optionIdx === questions[currentIdx].correctIdx) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedIdx(null);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setGameState("summary");
    }
  };

  return (
    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100/80 shadow-md max-w-2xl mx-auto mt-6 transition duration-300">
      
      {/* 1. INTRO STATE */}
      {gameState === "intro" && (
        <div className="text-center space-y-4 py-4 animate-fade-in">
          <div className="inline-flex p-3 bg-indigo-100 text-indigo-700 rounded-2xl shadow-inner">
            <Gamepad2 className="w-8 h-8 animate-bounce-subtle" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-lg sm:text-xl">
              🎮 Thử Thách Trắc Nghiệm Nghề Nghiệp
            </h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Chào {studentName}! Em đã sẵn sàng tham gia thử thách nhanh 3 câu hỏi trắc nghiệm để khám phá những điều thú vị về nghề <strong>{careerName}</strong> chưa?
            </p>
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-bold bg-rose-50 p-2 rounded-xl inline-block">
              ⚠️ {error}
            </p>
          )}

          <button
            onClick={startQuiz}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition active:scale-95 cursor-pointer block mx-auto text-sm"
          >
            Bắt đầu khám phá ngay!
          </button>
        </div>
      )}

      {/* 2. LOADING STATE */}
      {gameState === "loading" && (
        <div className="flex flex-col items-center justify-center py-10 space-y-3 animate-pulse">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">
            Kiến Trúc Sư AI đang biên soạn bộ câu hỏi cho em...
          </p>
        </div>
      )}

      {/* 3. ACTIVE QUIZ STATE */}
      {gameState === "quiz" && questions[currentIdx] && (
        <div className="space-y-6 animate-fade-in">
          {/* Question Info Bar */}
          <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">
              Câu hỏi {currentIdx + 1} / {questions.length}
            </span>
            <span className="text-xs font-medium text-slate-400">
              Đúng: {score} câu
            </span>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-800 text-base sm:text-lg leading-relaxed flex items-start gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
              <span>{questions[currentIdx].question}</span>
            </h5>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3">
            {questions[currentIdx].options.map((option, idx) => {
              const isSelected = selectedIdx === idx;
              const isCorrect = idx === questions[currentIdx].correctIdx;
              const isWrong = isSelected && !isCorrect;

              let btnClass = "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300";
              if (selectedIdx !== null) {
                if (isCorrect) {
                  btnClass = "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold";
                } else if (isWrong) {
                  btnClass = "bg-rose-50 border-rose-500 text-rose-800 font-bold";
                } else {
                  btnClass = "bg-white border-slate-100 text-slate-400 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  disabled={selectedIdx !== null}
                  className={`w-full p-4 text-left rounded-2xl border-2 text-sm transition-all duration-200 flex items-center justify-between select-none ${
                    selectedIdx === null ? "cursor-pointer active:scale-[0.99]" : "cursor-default"
                  } ${btnClass}`}
                >
                  <span className="flex-1 pr-2">{option}</span>
                  {selectedIdx !== null && (
                    <span className="flex-shrink-0">
                      {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      {isWrong && <XCircle className="w-5 h-5 text-rose-600" />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Explanation & Next Trigger */}
          {selectedIdx !== null && (
            <div className="space-y-4 pt-2 animate-fade-in">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl space-y-1">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                  📚 Kiến thức bổ ích:
                </p>
                <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed font-medium">
                  {questions[currentIdx].explanation}
                </p>
              </div>

              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer ml-auto text-sm"
              >
                <span>
                  {currentIdx + 1 === questions.length ? "Xem kết quả chung cuộc" : "Câu tiếp theo"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. SUMMARY STATE */}
      {gameState === "summary" && (
        <div className="text-center space-y-6 py-4 animate-fade-in">
          {/* Star Reward Animations */}
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3].map((num) => (
              <Star
                key={num}
                className={`w-10 h-10 ${
                  num <= score
                    ? "text-amber-400 fill-amber-400 animate-bounce-subtle"
                    : "text-slate-200 fill-slate-200"
                }`}
                style={{ animationDelay: `${num * 150}ms` }}
              />
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-800 text-xl sm:text-2xl flex items-center justify-center gap-2">
              <Award className="w-6 h-6 text-indigo-600" />
              <span>Hoàn Thành Thử Thách!</span>
            </h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Chúc mừng <strong>{studentName}</strong> đã xuất sắc trả lời đúng <strong>{score}/{questions.length}</strong> câu hỏi về nghề <strong>{careerName}</strong>.
            </p>
            <p className="text-xs text-indigo-600 font-bold max-w-xs mx-auto italic">
              {score === 3 
                ? "Thật tuyệt vời! Em có sự hiểu biết sâu sắc và tiềm năng rất lớn đối với nghề này!"
                : score === 2 
                ? "Rất tốt! Em đã nắm được những nét chính của công việc rồi đó!"
                : "Không sao cả em ơi, mỗi lần trả lời là một lần học hỏi thêm kiến thức mới mà!"
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={startQuiz}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Chơi bộ câu hỏi khác</span>
            </button>
            <button
              onClick={() => setGameState("intro")}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition text-xs cursor-pointer"
            >
              Quay lại ban đầu
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
