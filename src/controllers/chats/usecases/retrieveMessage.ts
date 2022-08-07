import { Logger } from "@nestjs/common";
import { Failure, NOT_AUTHORIZED_FAILURE, NOT_FOUND_FAILURE } from "src/models/app.models";
import { AuthSession } from "src/models/auth.models";
import { Chat } from "src/models/chats/chat.model";
import { Message } from "src/models/chats/message.model";

export default function retrieveMessage(logger: Logger) {
    return async (chatId: string, messageId: string, session: AuthSession): Promise<Message> => {
        const chat = await Chat.retrieve(chatId);
        if (!chat) {
            throw new Failure("not found", NOT_FOUND_FAILURE);
        }

        if (!chat.participants.includes(session.decodedToken.uid)) {
            throw new Failure("not authorized", NOT_AUTHORIZED_FAILURE);
        }

        const message = await Message.retrieve(chatId, messageId);
        if (!message) {
            throw new Failure("not found", NOT_FOUND_FAILURE);
        }

        return message;
    }
}