export type SendFunction = (recipient: string, message: string) => void;

export interface QueuedMessage {
  recipient: string;
  message: string;
  scheduledTime?: string | Date;
}
