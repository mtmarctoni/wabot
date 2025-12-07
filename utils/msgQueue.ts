import schedule from "node-schedule";
import type { SendFunction, QueuedMessage } from "../types/msgQueue.js";

class MsgQueue {
  private static instance: MsgQueue;
  private queue: QueuedMessage[] = [];
  private sendFunction: SendFunction | null = null;
  private isInitialized = false;

  private constructor() {
    console.log("🔍 MsgQueue instance created:", this);
  }

  public static getInstance(): MsgQueue {
    if (!MsgQueue.instance) {
      MsgQueue.instance = new MsgQueue();
    }
    return MsgQueue.instance;
  }

  public setSendFunction(sendFunction: SendFunction) {
    this.sendFunction = sendFunction;
    this.isInitialized = true;
    console.log("✅ Send function has been set:", sendFunction.toString());
  }

  public scheduleMessage(
    recipient: string,
    message: string,
    scheduledTime: string | Date
  ) {
    console.log(`🔍 Checking isInitialized: ${this.isInitialized}`);
    if (!this.isInitialized) {
      console.log("❌ MsgQueue not initialized. Queueing message for later.");
      this.queue.push({ recipient, message, scheduledTime });
      return;
    }

    console.log("📅 Scheduling message...");
    schedule.scheduleJob(new Date(scheduledTime), () => {
      if (this.sendFunction) {
        this.sendFunction(recipient, message);
      } else {
        console.log("⚠️ Send function not set. Message:", {
          recipient,
          message,
        });
        this.queue.push({ recipient, message });
      }
    });

    console.log(`✅ Message scheduled for ${recipient} at ${scheduledTime}`);
  }

  public processPendingMessages() {
    while (this.queue.length > 0 && this.sendFunction) {
      const { recipient, message } = this.queue.shift()!;
      this.sendFunction(recipient, message);
    }
  }
}

export const msgQueue = MsgQueue.getInstance();
