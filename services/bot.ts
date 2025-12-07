import { MessageMedia } from "whatsapp-web.js";
import { config } from "../config";
import { parseAudio } from "../utils";

const { me, senders } = config;
const myChatId = `${me}@c.us`;

// --- Service: Main bot message listener ---
export const listenMessages = async (client: any, msgQueue: any) => {
  client.on("message_create", async (msgObject: any) => {
    const { from, to, body, type, hasMedia, fromMe } = msgObject;
    let media = "";
    logIncomingMsg(msgObject);

    if (!fromMe) {
      if (hasMedia) {
        try {
          media = await msgObject.downloadMedia();
        } catch (err) {
          console.log("Error downloading media: ", media);
        }
      }
      resendMsgToMe(client, msgObject, media);
    }

    if (body.startsWith("/schedule") && from === to) {
      // add validation function to check the number and minutes (the args)
      // if there is no match, send an error message and help the user
      const auxContent = body.split(" ");
      const numberES = auxContent[1];
      const recipient = `34${numberES}`;
      const min = auxContent[2];
      const content = auxContent.slice(3).join(" ");
      msgQueue.scheduleMessage(
        recipient,
        content,
        new Date(Date.now() + min * 60 * 1000)
      );
      await sendTextMessage(
        client,
        myChatId,
        `Mensaje Programado para enviar en ${min} minutos`
      );
    }
  });
};

// --- Service: Resend message to self ---
export const resendMsgToMe = async (
  client: any,
  msgObject: any,
  media: any
) => {
  const { from, body, type, _data } = msgObject;
  const parsedFrom = parseFrom(from);
  const notifyName = _data?.notifyName || "unknown";
  let msgContent = `From ${parsedFrom.sender} [${notifyName}]\n-> ${parsedFrom.chatType} [${type}]`;

  if (parsedFrom.chatType === "newsletter") return;
  if (parsedFrom.chatType === "broadcast") return;
  if (type === "chat") {
    msgContent += `\n${body}`;
    await sendTextMessage(client, myChatId, msgContent);
  }
  if (type === "image") {
    msgContent += `\nCaption: ${body}`;
    const mimetype = media.mimetype;
    const dataBase64 = media.data;
    await sendFileBase64(client, myChatId, mimetype, dataBase64, msgContent);
  }
  if (type === "video") {
    msgContent += `\nCaption: ${body}`;
    const mimetype = media.mimetype;
    const dataBase64 = media.data;
    try {
      await sendTextMessage(client, myChatId, msgContent);
      await sendFileBase64(client, myChatId, mimetype, dataBase64, msgContent);
    } catch (err) {
      console.error("Error resending video to me: ", err);
    }
  }
  if (type === "ptt") {
    const mimetype = media.mimetype;
    const dataBase64 = media.data;
    if (parsedFrom.chatType === "chat") {
      const audioText = await parseAudio(mimetype, dataBase64);
      msgContent += `\nAudio Text: ${audioText}`;
    }
    await sendTextMessage(client, myChatId, msgContent);
    await sendFileBase64(client, myChatId, mimetype, dataBase64, msgContent);
  }
};

// --- Service: Send text message ---
export const sendTextMessage = async (client: any, to: string, msg: string) => {
  console.log("hay que enviar msg:\n", msg);
  try {
    await client.sendMessage(to, msg);
    console.log(`Message sent to ${to}: ${msg}`);
  } catch (err) {
    console.error(err);
  }
};

// --- Service: Send file as base64 ---
export const sendFileBase64 = async (
  client: any,
  to: string,
  mimetype: string,
  data: string,
  msgContent: string
) => {
  const auxFile = new MessageMedia(mimetype, data);
  await client.sendMessage(to, auxFile, { caption: msgContent });
  console.log(`File sent to ${to}`);
};

// --- Service: Send local file ---
export const sendLocalFile = (client: any, to: string, file: string) => {
  const auxFile = MessageMedia.fromFilePath(`.\\media\\${file}`);
  client.sendMessage(to, auxFile);
  console.log(`Se envió la imagen ${file}`);
};

// --- Helper: Parse sender info ---
export function parseFrom(from: string) {
  const chatId = from.slice(0, from.indexOf("@"));
  const dotExists = from.includes(".");
  let chatType = from.slice(
    from.indexOf("@") + 1,
    dotExists ? from.indexOf(".") : from.length
  );
  const usType = dotExists ? from.slice(from.indexOf(".") + 1) : "";
  const sender = senders[chatId] ? `*${senders[chatId]}*` : chatId;
  if (chatType === "c") chatType = "chat";
  if (chatType === "g") chatType = "group";
  return { sender, chatType, usType };
}

// --- Helper: Log incoming message ---
export function logIncomingMsg(msgObject: any) {
  const { from, to, body, type, hasMedia, fromMe } = msgObject;
  console.log(
    `-------\n📨 Incoming message:\n    ‣> 💬 From: ${from}\n    ‣> 👂 To: ${to}\n    ‣> 📝 Body: ${body}\n    ‣> 📱 Type: ${type}\n    ‣> 📸 Has media: ${hasMedia}\n    ‣> 🙎‍♂️ From me: ${fromMe}\n-------`
  );
}
