export type MessageSender = "AI" | "CUSTOMER" | "SYSTEM";
export type MessageChannel = "email" | "whatsapp" | "in_app";

export interface Message {
  _id: string;
  customer: string;
  recoveryCase: string;
  sender: MessageSender;
  channel: MessageChannel;
  content: string;
  messageType: string;
  createdAt: string;
  updatedAt: string;
}

// ⚠️ ASSUMPTION — exact shape of CustomerIntent unknown, adjust once responseInterpreter.ts is shared
export interface CustomerIntent {
  intent: "promise_to_pay" | "dispute" | "request_help" | "refusal" | string;
  promisedDate?: string;
  [key: string]: unknown; // catch-all for fields I haven't seen (confidence, reasoning, etc.)
}

export type FollowUpAction = "retry_scheduled" | "escalated" | "stopped" | "no_change";

export interface ReplyAsCustomerResponse {
  message: Message;
  intent: CustomerIntent;
  followUp: { action: FollowUpAction };
}