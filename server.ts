import express from "express";
import path from "path";
import fs from "fs";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { msgQueue } from "./utils";
import { config } from "./config";
import { listenMessages } from "./services";
import { formatMessages } from "./utils";

const frontendIndex = path.join(process.cwd(), "client/dist/index.html");

const client = new Client({
  puppeteer: {
    headless: true,
    //args: [ '--no-sandbox', '--disable-setuid-sandbox', ]
  },
  authStrategy: new LocalAuth({ clientId: "mtm" }),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("remote_session_saved", () => {
  console.log("Session saved successfully");
});

client.on("ready", () => {
  console.log("🤖 Client is ready!");
  msgQueue.setSendFunction((recipient: string, message: string) => {
    client
      .sendMessage(`${recipient}@c.us`, message)
      .then(() => console.log(`📤 Message sent to ${recipient}: ${message}`))
      .catch((err) => console.error("❌ Error sending message:", err));
  });
  msgQueue.processPendingMessages();
  listenMessages(client, msgQueue);
});

client.initialize();

const app = express();
const { port } = config;

// Serve static files from the React app build directory
app.use(express.static(path.join(process.cwd(), "client/dist")));

// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// API route for scheduling messages
import type { Request, Response } from "express";

app.post("/api/schedule", (req: Request, res: Response) => {
  const { recipient, message, scheduledTime } = req.body;
  msgQueue.scheduleMessage(recipient, message, scheduledTime);
  res.json({ success: true, message: "Message scheduled successfully" });
});

// API route to get last N messages from a chat or group
app.get("/api/chat-messages", async (req: Request, res: Response) => {
  const chatId = req.query.chatId as string;
  const count = parseInt(req.query.count as string, 10);
  if (!chatId || typeof chatId !== "string" || chatId.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "chatId is required and must be a non-empty string.",
    });
  }
  if (!count || isNaN(count) || count < 1) {
    return res.status(400).json({
      success: false,
      message: "count is required and must be a positive integer.",
    });
  }
  try {
    const chat = await client.getChatById(chatId);
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found." });
    }
    const messages = await chat.fetchMessages({ limit: count });
    const formattedMessages = formatMessages(messages);
    res.json({ success: true, chatId, count, messages: formattedMessages });
  } catch (err) {
    console.error("Error fetching chat messages:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching chat messages.",
    });
  }
});

// Handles any requests that don't match the above if there is a frontend build
app.get("*", (req: Request, res: Response) => {
  if (fs.existsSync(frontendIndex)) {
    res.sendFile(frontendIndex);
  } else {
    res.status(404).json({
      success: false,
      message: "Not found. No frontend build available.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
