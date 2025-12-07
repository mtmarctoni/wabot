export interface Message {
  id: string;
  from: string;
  to: string;
  fromMe: boolean;
  type: string;
  timestamp: number | string;
  body: string;
  hasMedia: boolean;
  mediaUrl: string | null;
}
