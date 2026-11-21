import { generateText } from "../../services/ai/aiservice.js";
import checkUserAuthentication from "../../utils/auth/user.auth.js";

export const testAI = async (req, res) => {
  try {
    const { prompt, prevMessages = [] } = req?.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        message: "Prompt cannot be empty",
        success: false,
      });
    }

    res.statusCode = 200;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");

    if (typeof res.flushHeaders === "function") {
      res.flushHeaders();
    }
    const user = await checkUserAuthentication(req, res);
    const stream = generateText({
      prompt: prompt.trim(),
      prevMessages: Array.isArray(prevMessages) ? prevMessages : [],
      user,
    });

    for await (const chunk of stream) {
      if (res.writableEnded) {
        break;
      }

      res.write(chunk);
    }

    if (!res.writableEnded) {
      res.end();
    }
  } catch (error) {
    console.error("Error in testAI controller:", error);

    /*
     * Once streaming has started, headers/status cannot be changed.
     */
    if (res.headersSent) {
      if (!res.writableEnded) {
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
