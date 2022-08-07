import { Logger } from "@nestjs/common";
import { Failure, NOT_AUTHORIZED_FAILURE, NOT_FOUND_FAILURE } from "src/models/app.models";
import { AuthSession } from "src/models/auth.models";
import { Chat } from "src/models/chats/chat.model";
import { ListMessagesQuery, Message } from "src/models/chats/message.model";

export default function listMessages(logger: Logger) {
    return async (chatId: string, query: ListMessagesQuery, session: AuthSession): Promise<Message[]> => {
        logger.debug("chatId", { chatId });
        const chat = await Chat.retrieve(chatId);
        if (!chat) {
            throw new Failure("not found", NOT_FOUND_FAILURE);
        }

        if (!chat.participants.includes(session.decodedToken.uid)) {
            throw new Failure("not authorized", NOT_AUTHORIZED_FAILURE);
        }

        return await Message.list(chatId, query);
    }
}