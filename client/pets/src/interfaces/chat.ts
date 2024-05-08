import {Message} from "./message.ts";

export interface Chat {
    sessionId: string;
    participants: string[];
    messages: Message[];
    date: string;
}