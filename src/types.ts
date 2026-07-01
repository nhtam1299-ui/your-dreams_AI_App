export interface DreamState {
  name: string;
  careerId: string;
  customCareer: string;
  gender: "Nam" | "Nữ";
  photoUrl: string | null; // captured face base64
}

export interface CareerOption {
  id: string;
  name: string;
  englishName: string;
  icon: string; // lucide icon name
  description: string;
  promptMale: string;
  promptFemale: string;
  gradient: string;
  textColor: string;
  borderColor: string;
}

export interface DreamResult {
  id: string;
  name: string;
  careerId: string;
  careerName: string;
  gender: "Nam" | "Nữ";
  greeting: string;
  aiPrompt: string;
  inspiration: string;
  statusText: string;
  imageUrl: string | null; // Base64 or URL from Gemini
  photoUrl: string | null; // original captured face base64
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export type ChatPersona = "advisor" | "expert" | "mentor";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

