import { Logger } from "@nestjs/common";
import { BAD_REQUEST_FAILURE, Failure, NOT_AUTHORIZED_FAILURE, NOT_FOUND_FAILURE } from "src/models/app.models";
import { AuthSession } from "src/models/auth.models";
import { Chat } from "src/models/chats/chat.model";
import { Message } from "src/models/chats/message.model";

export default function updateMessage(logger: Logger) {
    return async (
        chatId: string, messageId: string,
        payload: Message, session: AuthSession
    ): Promise<Message> => {
        if (payload.chatId != chatId) {
            throw new Failure("bad request", BAD_REQUEST_FAILURE);
        }
        if (payload.id != messageId) {
            throw new Failure("bad request", BAD_REQUEST_FAILURE);
        }

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

        if (message.type != "text") {
            throw new Failure("Only text type messages can be modified", BAD_REQUEST_FAILURE);
        }

        message.edited = true;
        message.updatedAt = new Date().getTime();
        message.updatedBy = session.decodedToken.uid;
        message.contents = payload.contents;

        const savedMessage = await Message.save(message);

        return savedMessage;
    }
}