import { generateText } from "../../services/ai/aiservice.js";
import checkUserAuthentication from "../../utils/auth/user.auth.js";

export const testAI = async (req, res) => {
  try {
    // 1. Validate prompt
    const { prompt, prevMessages = [] } = req.body ?? {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        message: "Prompt cannot be empty",
        success: false,
      });
    }

    // 2. Authenticate BEFORE streaming
    const user = await checkUserAuthentication(req, res);

    // The authentication helper may have sent a response.
    if (res.headersSent || res.writableEnded) {
      return;
    }

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    // 3. Configure streaming headers
    res.status(200);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (typeof res.flushHeaders === "function") {
      res.flushHeaders();
    }

    // 4. Generate AI response
    const stream = generateText({
      prompt: prompt.trim(),
      prevMessages: Array.isArray(prevMessages) ? prevMessages : [],
      user,
    });

    // 5. Stream the response
    for await (const chunk of stream) {
      if (res.destroyed || res.writableEnded) {
        break;
      }

      res.write(chunk);
    }

    // 6. Finish response
    if (!res.writableEnded && !res.destroyed) {
      res.end();
    }
  } catch (error) {
    console.error("Error in testAI controller:", error);

    // Never send JSON after streaming has started.
    if (res.headersSent) {
      if (!res.writableEnded && !res.destroyed) {
        res.end();
      }
      return;
    }

    return res.status(error?.status === 503 ? 503 : 500).json({
      message:
        error?.status === 503
          ? "MaphyAI is temporarily unavailable. Please try again."
          : "Internal Server Error",
      success: false,
    });
  }
};
