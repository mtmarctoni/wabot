import { Message } from "../types";

// Accepts any[] for now, but you can define a more specific WhatsApp message type later
export function formatMessages(messages: any[]): Message[] {
  return messages.map((msg): Message => {
    return {
      id: msg.id?._serialized || msg.id,
      from: msg.from,
      to: msg.to,
      fromMe: msg.fromMe,
      type: msg.type,
      timestamp: msg.timestamp || msg.t,
      body: msg.body || msg.caption || "",
      hasMedia: msg.hasMedia || false,
      mediaUrl: msg.deprecatedMms3Url || msg.directPath || null,
    };
  });
}
