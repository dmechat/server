import { Logger } from "@nestjs/common";
import { BAD_REQUEST_FAILURE, Failure, NOT_AUTHORIZED_FAILURE, NOT_FOUND_FAILURE } from "src/models/app.models";
import { AuthSession } from "src/models/auth.models";
import { Chat } from "src/models/chats/chat.model";
import { Message } from "src/models/chats/message.model";

const ksuid = require("ksuid");

export default function sendMessage(logger: Logger) {
    return async (chatId: string, payload: Message, session: AuthSession): Promise<Message> => {
        // check that chat exists
        const chat = await Chat.retrieve(chatId);
        if (!chat) {
            throw new Failure("not found", NOT_FOUND_FAILURE);
        }
        // session user is a participant
        if (!chat.participants.includes(session.decodedToken.uid)) {
            throw new Failure("Not authorized", NOT_AUTHORIZED_FAILURE);
        }

        if (payload.senderId != session.decodedToken.uid) {
            throw new Failure("Not authorized", NOT_AUTHORIZED_FAILURE);
        }

        if (payload.type != "text") {
            throw new Failure("Not implemented");
        }

        if (payload.chatId != chatId) {
            throw new Failure("bad request", BAD_REQUEST_FAILURE);
        }

        // prep the object and populate the message id
        payload.id = ksuid.randomSync().string;
        payload.createdAt = new Date().getTime();
        payload.createdBy = session.decodedToken.uid;
        payload.edited = false;

        const message = await Message.save(payload);
        logger.debug("saved message", { message });
        return message;
    }
}