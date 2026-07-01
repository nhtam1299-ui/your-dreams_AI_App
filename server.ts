import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { careers } from "./src/careers";

const PORT = 3000;

function getClientForRequest(req: Request): GoogleGenAI | null {
  const apiKey = (req.headers["x-api-key"] as string) || (req.headers["authorization"] as string) || process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return null;
}


async function startServer() {
  const app = express();
  
  // Set larger limit for base64 photo uploads
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // API Route: Create Dream Text Narrative
  app.post("/api/dream/text", async (req: Request, res: Response) => {
    try {
      const { name, careerId, customCareer, gender } = req.body;
      const modelName = (req.headers["x-gemini-model"] as string) || "gemini-3.5-flash";

      if (!name) {
        return res.status(400).json({ error: "Vui lòng nhập tên học sinh!" });
      }

      // Identify the career
      let careerName = "";
      let basePrompt = "";
      
      const matchedCareer = careers.find(c => c.id === careerId);
      if (matchedCareer) {
        careerName = matchedCareer.name;
        basePrompt = gender === "Nam" ? matchedCareer.promptMale : matchedCareer.promptFemale;
      } else {
        careerName = customCareer || "Chuyên gia tương lai";
        basePrompt = `A successful and professional ${gender === "Nam" ? "male" : "female"} ${careerName} in their modern working environment, looking confident and smiling warmly, professional clothing, highly detailed, photorealistic 8k, cinematic lighting.`;
      }

      const client = getClientForRequest(req);

      if (!client) {
        // Fallback simulation
        console.log("No Gemini API key found, generating high-quality fallback simulation data...");
        const fallbackPrompt = `Một ${gender === "Nam" ? "nam" : "nữ"} ${careerName} xuất sắc đang làm việc trong môi trường chuyên nghiệp, gương mặt rạng rỡ niềm vui và sự tự tin. Ánh sáng chuyên nghiệp, độ phân giải cao.`;
        
        return res.json({
          careerName,
          greeting: `Chào ${name}! Thật tuyệt vời khi biết ước mơ của em là trở thành một ${careerName}! Đây là một bước đi đầy ý nghĩa hướng tới tương lai tốt đẹp.`,
          aiPrompt: fallbackPrompt,
          inspiration: `Hình ảnh này chính là tương lai đang chờ đón em. Để trở thành một ${careerName} tài giỏi, hãy bắt đầu từ những bài học nhỏ hôm nay nhé. Cố gắng lên, ${name} ơi!`,
        });
      }

      // Generate the text narrative via user's selected Gemini model
      const systemInstruction = `Bạn là "Kiến Trúc Sư Ước Mơ", một chuyên gia tư vấn hướng nghiệp ảo và điều phối viên sáng tạo hình ảnh cho ứng dụng "Ước mơ của em". Vai trò của bạn không chỉ là một công cụ xử lý kỹ thuật mà còn là một người truyền cảm hứng, giúp học sinh nhìn thấy phiên bản thành công của chính mình trong tương lai thông qua công nghệ AI hóa thân (Face-swap).

Quy trình và tiêu chuẩn:
- Lời chào phải truyền cảm hứng mãnh liệt và mang tính cá nhân hóa cao cho học sinh tên "${name}".
- Tạo một prompt tiếng Anh siêu chi tiết để vẽ ảnh chân dung nghề nghiệp ${careerName} cho một người giới tính ${gender}. Trang phục và bối cảnh phải cực kỳ đặc trưng cho ngành nghề, phong thái tự tin, tràn đầy nhiệt huyết.
- Lời nhắn nhủ khích lệ tinh thần học tập và khơi gợi ước mơ.
- Câu trả lời phải trả về định dạng JSON theo đúng schema.`;

      const textResponse = await client.models.generateContent({
        model: modelName,
        contents: `Hãy kiến tạo ước mơ cho học sinh tên là "${name}", muốn trở thành "${careerName}", giới tính "${gender}".`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              greeting: { 
                type: Type.STRING,
                description: "Lời chào và xác nhận ước mơ đầy tình cảm và khích lệ." 
              },
              aiPrompt: { 
                type: Type.STRING,
                description: "Prompt tiếng Anh cực kỳ chi tiết, sống động để vẽ một bức chân dung người có nghề nghiệp này với giới tính tương ứng." 
              },
              inspiration: { 
                type: Type.STRING,
                description: "Thông điệp truyền cảm hứng học tập và theo đuổi đam mê dành riêng cho em học sinh." 
              }
            },
            required: ["greeting", "aiPrompt", "inspiration"]
          }
        }
      });

      let responseText = textResponse.text || "{}";
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError, responseText);
        parsedData = {
          greeting: `Chào ${name}! Thật tuyệt vời khi biết ước mơ của em là trở thành một ${careerName}!`,
          aiPrompt: basePrompt,
          inspiration: `Hình ảnh này chính là tương lai đang chờ đón em. Hãy bắt đầu từ những việc nhỏ hôm nay nhé. Cố gắng lên, ${name} ơi!`
        };
      }

      res.json({
        careerName,
        greeting: parsedData.greeting,
        aiPrompt: parsedData.aiPrompt || basePrompt,
        inspiration: parsedData.inspiration,
      });

    } catch (error: any) {
      console.error("Endpoint /api/dream/text error:", error);
      res.status(500).json({ error: error.message || "Đã xảy ra lỗi hệ thống khi phân tích lộ trình!" });
    }
  });

  // API Route: Create Dream Image
  app.post("/api/dream/image", async (req: Request, res: Response) => {
    try {
      const { aiPrompt } = req.body;
      const client = getClientForRequest(req);

      if (!client) {
        return res.json({ imageUrl: null });
      }

      console.log(`Generating career image with prompt: ${aiPrompt}...`);
      let imageUrl: string | null = null;
      
      const imageResponse = await client.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [
            {
              text: aiPrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          }
        },
      });

      if (imageResponse.candidates && imageResponse.candidates[0]?.content?.parts) {
        for (const part of imageResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${base64EncodeString}`;
            console.log("Career image generated successfully!");
            break;
          }
        }
      }

      res.json({ imageUrl });

    } catch (error: any) {
      console.error("Endpoint /api/dream/image error:", error);
      res.status(500).json({ error: error.message || "Đã xảy ra lỗi khi tạo hình ảnh!" });
    }
  });

  // API Route: Interactive Chat with Dream Architect
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { messages, career, gender, name, persona } = req.body;
      const modelName = (req.headers["x-gemini-model"] as string) || "gemini-3.5-flash";

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Thiếu lịch sử trò chuyện!" });
      }

      const client = getClientForRequest(req);

      if (!client) {
        // Mock fallback chat answer
        const lastMessage = messages[messages.length - 1]?.text || "";
        let mockAnswer = "";
        if (persona === "advisor") {
          mockAnswer = `[Thầy Cô Hướng Nghiệp] Chào ${name}! Để chuẩn bị tốt nhất cho ước mơ làm ${career}, em nên tập trung học tốt các môn học liên quan ở trường và rèn luyện thói quen tự học mỗi ngày nhé!`;
        } else if (persona === "expert") {
          mockAnswer = `[Chuyên Gia] Chào em! Công việc của một ${career} thực tế rất thú vị nhưng cũng đầy thử thách. Hằng ngày anh/chị phải giải quyết rất nhiều bài toán thực tế đó!`;
        } else {
          mockAnswer = `[Người Truyền Lửa] Chào ${name}! Đừng lo lắng nếu bây giờ em thấy khó khăn. Mọi hành trình vạn dặm đều bắt đầu từ một bước đi nhỏ. Hãy tin vào bản thân mình nhé!`;
        }
        return res.json({ text: mockAnswer });
      }

      // Run chat session with selected Gemini model with specialized personas
      let systemInstruction = "";
      if (persona === "advisor") {
        systemInstruction = `Bạn là "Thầy/Cô Hướng Nghiệp", một tư vấn viên học đường ảo vô cùng tận tụy và ấm áp cho học sinh tên là "${name}" (giới tính "${gender}"), có ước mơ trở thành "${career}".
Nhiệm vụ của bạn là:
- Tư vấn về lộ trình học tập, đề xuất các môn học cần tập trung ở trường để chuẩn bị cho nghề này.
- Đề xuất các phương pháp học tập hiệu quả, các đầu sách hoặc tài liệu tự học hữu ích.
- Nói chuyện bằng tiếng Việt, thân thiện, dễ hiểu, mang tính giáo dục cao. Tránh dùng thuật ngữ quá hàn lâm.`;
      } else if (persona === "expert") {
        systemInstruction = `Bạn là "Chuyên Gia Ngành Nghề", một chuyên gia giàu kinh nghiệm đang trực tiếp làm việc trong lĩnh vực "${career}". Bạn trò chuyện với học sinh tên là "${name}" (giới tính "${gender}").
Nhiệm vụ của bạn là:
- Chia sẻ trải nghiệm thực tế về công việc hàng ngày, những điều thú vị cũng như khó khăn, thử thách thực tế trong nghề.
- Giải đáp thắc mắc về môi trường làm việc, văn hóa công ty, các dự án thực tế.
- Trả lời bằng tiếng Việt chuyên nghiệp nhưng gần gũi, khơi gợi sự tò mò và lòng say mê nghề nghiệp cho học sinh.`;
      } else { // persona === 'mentor'
        systemInstruction = `Bạn là "Người Truyền Lửa Hướng Nghiệp", một người anh/chị đi trước luôn đồng hành, thấu hiểu và truyền cảm hứng mạnh mẽ cho học sinh tên là "${name}" (giới tính "${gender}"), ước mơ là "${career}".
Nhiệm vụ của bạn là:
- Lắng nghe những băn khoăn, áp lực học tập hoặc sự thiếu tự tin của học sinh.
- Động viên tinh thần học tập, chia sẻ các bài học về sự kiên trì, kiên định theo đuổi đam mê.
- Trò chuyện bằng tiếng Việt cực kỳ ấm áp, tràn đầy năng lượng tích cực, dùng các câu trích dẫn hoặc câu chuyện truyền cảm hứng ngắn gọn.`;
      }

      // Build contents array for GenerateContentParameters
      const contents = messages.map((msg: any) => {
        return {
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        };
      });

      const chatResponse = await client.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction,
        }
      });

      res.json({ text: chatResponse.text || "Xin lỗi em, anh chưa nghe rõ, em nói lại nhé!" });

    } catch (error: any) {
      console.error("Endpoint /api/chat error:", error);
      res.status(500).json({ error: error.message || "Đã xảy ra lỗi khi trò chuyện!" });
    }
  });

  // API Route: Generate career quiz questions
  app.post("/api/quiz", async (req: Request, res: Response) => {
    try {
      const { careerName, studentName } = req.body;
      const modelName = (req.headers["x-gemini-model"] as string) || "gemini-3.5-flash";

      if (!careerName) {
        return res.status(400).json({ error: "Thiếu tên ngành nghề!" });
      }

      const client = getClientForRequest(req);

      if (!client) {
        // Fallback simulated quiz questions
        console.log("No Gemini API key found, generating high-quality fallback quiz data...");
        return res.json({
          questions: [
            {
              id: "q1",
              question: `Nhiệm vụ chính quan trọng nhất của một ${careerName} là gì?`,
              options: [
                "Làm việc theo đúng chuyên môn để tạo ra giá trị thiết thực",
                "Chỉ đi chơi và không làm việc gì cả",
                "Trốn tránh trách nhiệm khi gặp khó khăn",
                "Đợi người khác làm hộ việc của mình"
              ],
              correctIdx: 0,
              explanation: "Chính xác! Mỗi ngành nghề đều có vai trò riêng để phục vụ và mang lại lợi ích cho cộng đồng."
            },
            {
              id: "q2",
              question: `Thái độ học tập nào sau đây là quan trọng nhất để em đạt được ước mơ trở thành ${careerName}?`,
              options: [
                "Học vẹt đối phó để lấy điểm cao nhất thời",
                "Luôn tò mò, kiên trì tự học và vượt qua khó khăn",
                "Chán nản và từ bỏ ngay khi bài toán khó",
                "Không thèm quan tâm đến bài học trên lớp"
              ],
              correctIdx: 1,
              explanation: "Tuyệt vời! Sự tò mò khám phá và tính kiên trì tự học là chìa khóa vàng mở cánh cửa thành công."
            },
            {
              id: "q3",
              question: `Để chuẩn bị kiến thức làm ${careerName} tương lai, từ bây giờ em nên học tập thế nào?`,
              options: [
                "Chờ đến khi lớn lên rồi mới bắt đầu học",
                "Học tốt các môn học căn bản và rèn luyện kỹ năng sống hàng ngày",
                "Chỉ cần chơi game cả ngày là đủ",
                "Không cần học hành gì vẫn sẽ giỏi"
              ],
              correctIdx: 1,
              explanation: "Rất chính xác! Từng bài học nhỏ và thói quen tốt từ hôm nay sẽ là những viên gạch vững chắc xây dựng tương lai."
            }
          ]
        });
      }

      const systemInstruction = `Bạn là một chuyên gia thiết kế trò chơi giáo dục và hướng nghiệp cho học sinh phổ thông.
Hãy tạo ra bộ đúng 3 câu hỏi trắc nghiệm ngắn gọn, thú vị, bổ ích liên quan đến công việc, kiến thức cơ bản hoặc kỹ năng của ngành nghề "${careerName}".
Đảm bảo ngôn ngữ tiếng Việt thân thiện, khích lệ. Định dạng trả về phải tuân thủ nghiêm ngập JSON Schema.`;

      const response = await client.models.generateContent({
        model: modelName,
        contents: `Hãy sinh 3 câu hỏi trắc nghiệm hướng nghiệp về nghề: "${careerName}" dành cho học sinh tên là "${studentName || "em"}".`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING, description: "Câu hỏi trắc nghiệm thú vị và bổ ích liên quan đến ngành nghề." },
                    options: { 
                      type: Type.ARRAY, 
                      items: { type: Type.STRING },
                      description: "Danh sách 4 lựa chọn đáp án (A, B, C, D)." 
                    },
                    correctIdx: { type: Type.INTEGER, description: "Chỉ số index của đáp án đúng (0 đến 3)." },
                    explanation: { type: Type.STRING, description: "Giải thích ngắn gọn tại sao đáp án đó đúng và cung cấp thêm kiến thức bổ ích cho học sinh." }
                  },
                  required: ["question", "options", "correctIdx", "explanation"]
                },
                description: "Danh sách đúng 3 câu hỏi trắc nghiệm."
              }
            },
            required: ["questions"]
          }
        }
      });

      const text = response.text || "{}";
      const parsedData = JSON.parse(text);

      // Inject IDs
      if (parsedData.questions && Array.isArray(parsedData.questions)) {
        parsedData.questions = parsedData.questions.map((q: any, idx: number) => ({
          ...q,
          id: `q_${idx}_${Math.random().toString(36).substr(2, 5)}`
        }));
      }

      res.json(parsedData);

    } catch (error: any) {
      console.error("Endpoint /api/quiz error:", error);
      res.status(500).json({ error: error.message || "Đã xảy ra lỗi khi sinh câu hỏi trắc nghiệm!" });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
