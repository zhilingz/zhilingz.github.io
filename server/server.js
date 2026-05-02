import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const profilePath = path.join(__dirname, "..", "profile.md");
const profile = fs.readFileSync(profilePath, "utf8");
const app = express();
const port = Number(process.env.PORT || 8787);
const model = process.env.OPENAI_MODEL || "gpt-5.5";
const allowedOrigin = process.env.ALLOWED_ORIGIN || "https://zhilingz.github.io";
const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

app.use(express.json({ limit: "32kb" }));
app.use(cors({ origin: allowedOrigin }));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({ error: "server_not_configured" });
    }

    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const input = messages
      .filter((message) => ["user", "assistant"].includes(message.role))
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content: String(message.content || "").slice(0, 1200)
      }));

    if (!input.length) {
      return res.status(400).json({ error: "missing_messages" });
    }

    const response = await client.responses.create({
      model,
      instructions: [
        "You are Zhiling Zhang's personal homepage agent.",
        "Answer only from the profile below.",
        "If the answer is not in the profile, say the information has not been added.",
        "Keep answers concise.",
        "",
        profile
      ].join("\n"),
      input
    });

    res.json({ answer: response.output_text || "该信息尚未添加。" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "chat_failed" });
  }
});

app.listen(port, () => {
  console.log(`homepage agent listening on ${port}`);
});
