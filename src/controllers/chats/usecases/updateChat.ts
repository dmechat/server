import { Logger } from "@nestjs/common";
import { AuthSession } from "src/models/auth.models";
import { Chat } from "src/models/chats/chat.model";


export default function updateChat(logger: Logger) {
    return async (id: string, payload: Chat, session: AuthSession): Promise<Chat> => {
        // const chat = await Chat.retrieve(payload.id);

        // add participants

        // remove participants

        throw new Error("not implemented")
    }
}