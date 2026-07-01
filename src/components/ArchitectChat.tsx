import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, RefreshCw, X, GraduationCap, Briefcase, Flame } from "lucide-react";
import { ChatMessage, ChatPersona } from "../types";

interface ArchitectChatProps {
  name: string;
  careerName: string;
  gender: "Nam" | "Nữ";
  onClose?: () => void;
}

export default function ArchitectChat({ name, careerName, gender, onClose }: ArchitectChatProps) {
  const [activePersona, setActivePersona] = useState<ChatPersona>("advisor");
  
  // Store chat history separately for each persona so history is preserved
  const [messagesByPersona, setMessagesByPersona] = useState<Record<ChatPersona, ChatMessage[]>>({
    advisor: [
      {
        id: "welcome_advisor",
        role: "model",
        text: `Chào ${name}! Cô là Thầy/Cô Hướng Nghiệp đây. Cô sẽ giúp em lên lộ trình học tập, chọn môn học và lập kế hoạch rèn luyện tốt nhất để trở thành một ${careerName} trong tương lai. Em muốn bắt đầu học từ môn nào hoặc cần cô gợi ý sách gì không?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    expert: [
      {
        id: "welcome_expert",
        role: "model",
        text: `Chào em! Anh/chị là Chuyên Gia Ngành Nghề hiện đang làm việc trong lĩnh vực ${careerName}. Anh/chị rất sẵn lòng chia sẻ với em về môi trường làm việc thực tế, những dự án thú vị cũng như khó khăn trong nghề. Em muốn tò mò điều gì nào?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    mentor: [
      {
        id: "welcome_mentor",
        role: "model",
        text: `Chào ${name}! Anh/chị là Người Truyền Lửa của em đây. Hãy chia sẻ với anh/chị nếu em thấy lo lắng, áp lực học tập hay thiếu tự tin nhé. Anh/chị tin rằng chỉ cần kiên trì, ước mơ làm ${careerName} của em nhất định sẽ thành hiện thực!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Persona configuration
  const personasConfig = {
    advisor: {
      name: "Thầy Cô Hướng Nghiệp",
      role: "Tư vấn học tập",
      icon: GraduationCap,
      color: "bg-teal-600 text-teal-100",
      activeColor: "border-teal-500 text-teal-600 bg-teal-50/50",
      avatarColor: "bg-teal-600",
      chips: [
        `Em cần tập trung học tốt những môn gì?`,
        `Có phương pháp học tập nào hiệu quả không cô?`,
        `Gợi ý sách hay về nghề ${careerName} ạ?`,
        `Kế hoạch tự học hàng tuần nên lập ra sao?`
      ]
    },
    expert: {
      name: "Chuyên Gia Trong Lĩnh Vực",
      role: "Kinh nghiệm thực tế",
      icon: Briefcase,
      color: "bg-amber-600 text-amber-100",
      activeColor: "border-amber-500 text-amber-600 bg-amber-50/50",
      avatarColor: "bg-amber-600",
      chips: [
        `Công việc hằng ngày của một ${careerName} là gì ạ?`,
        `Lĩnh vực này có những thách thức gì thú vị nhất?`,
        `Môi trường làm việc thực tế ra sao ạ?`,
        `Sau này em sẽ làm việc ở những đâu?`
      ]
    },
    mentor: {
      name: "Người Bạn Truyền Lửa",
      role: "Động lực & Cảm hứng",
      icon: Flame,
      color: "bg-rose-600 text-rose-100",
      activeColor: "border-rose-500 text-rose-600 bg-rose-50/50",
      avatarColor: "bg-rose-600",
      chips: [
        `Em sợ mình không đủ năng lực để làm nghề này...`,
        `Làm sao để rèn luyện sự kiên trì mỗi ngày ạ?`,
        `Em gặp áp lực học tập quá, làm sao giải tỏa?`,
        `Lấy động lực học từ đâu khi thấy chán nản ạ?`
      ]
    }
  };

  const currentMessages = messagesByPersona[activePersona];
  const config = personasConfig[activePersona];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: "msg_" + Math.random().toString(36).substr(2, 9),
      role: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Add user message to active persona's history
    const updatedHistory = [...currentMessages, userMsg];
    setMessagesByPersona((prev) => ({
      ...prev,
      [activePersona]: updatedHistory,
    }));
    
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({ role: m.role, text: m.text })),
          career: careerName,
          gender,
          name,
          persona: activePersona,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessagesByPersona((prev) => ({
          ...prev,
          [activePersona]: [
            ...updatedHistory,
            {
              id: "msg_" + Math.random().toString(36).substr(2, 9),
              role: "model",
              text: data.text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        }));
      } else {
        throw new Error(data.error || "Gặp sự cố kết nối với Kiến Trúc Sư");
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessagesByPersona((prev) => ({
        ...prev,
        [activePersona]: [
          ...updatedHistory,
          {
            id: "msg_" + Math.random().toString(36).substr(2, 9),
            role: "model",
            text: `Chào em! Có chút gián đoạn mạng một chút. Nhưng anh/chị muốn nhắn nhủ rằng ước mơ trở thành ${careerName} của em luôn rất tuyệt vời, hãy cố gắng lên nhé!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const CurrentIcon = config.icon;

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[550px] max-h-[85vh] animate-fade-in">
      
      {/* 1. Header & Close Button */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl text-white ${config.avatarColor}`}>
            <CurrentIcon className="w-5 h-5 animate-pulse-slow" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              {config.name}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Vai trò: {config.role} | Nghề: {careerName}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Persona Switcher Tabs */}
      <div className="grid grid-cols-3 bg-slate-950/60 border-b border-slate-800/80 p-1.5 gap-1.5">
        {(Object.keys(personasConfig) as ChatPersona[]).map((key) => {
          const item = personasConfig[key];
          const Icon = item.icon;
          const isActive = activePersona === key;

          return (
            <button
              key={key}
              onClick={() => setActivePersona(key)}
              className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer border ${
                isActive
                  ? "bg-slate-800 border-indigo-500/80 text-indigo-400 shadow-inner"
                  : "bg-slate-900/40 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{item.name.split(" ")[0] || item.name}</span>
              <span className="sm:hidden">{key === "advisor" ? "Giáo viên" : key === "expert" ? "Chuyên gia" : "Mentor"}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {currentMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 max-w-[85%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div className={`p-1.5 rounded-lg flex-shrink-0 text-white ${
              msg.role === "user" ? "bg-indigo-600" : config.avatarColor
            }`}>
              {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <CurrentIcon className="w-3.5 h-3.5 text-white" />}
            </div>

            {/* Content box */}
            <div className={`space-y-1 p-3 rounded-2xl ${
              msg.role === "user"
                ? "bg-indigo-600 text-white rounded-tr-none"
                : "bg-slate-800/80 text-slate-100 rounded-tl-none border border-slate-700/50"
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {msg.text}
              </p>
              <p className={`text-[10px] text-right ${msg.role === "user" ? "text-indigo-200" : "text-slate-400"}`}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-start gap-2.5 max-w-[80%]">
            <div className={`p-1.5 rounded-lg text-white ${config.avatarColor}`}>
              <CurrentIcon className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-slate-800/50 text-slate-400 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-800 flex items-center space-x-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span className="text-xs font-medium">Đang soạn câu trả lời...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Suggestion chips (dynamic based on active persona) */}
      <div className="px-4 py-2 bg-slate-950/50 border-t border-slate-800/40 flex items-center space-x-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        {config.chips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            disabled={isLoading}
            className="text-xs bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 px-3 py-1.5 rounded-full text-slate-300 transition select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* 5. Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Nhập câu hỏi gửi ${config.name.split(" ")[0]}...`}
          maxLength={150}
          className="flex-1 px-4 py-2.5 bg-slate-900 rounded-xl border border-slate-800 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white font-medium transition"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer disabled:opacity-45"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
