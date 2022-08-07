import { Logger } from "@nestjs/common";
import { Failure, NOT_AUTHORIZED_FAILURE, NOT_FOUND_FAILURE } from "src/models/app.models";
import { AuthSession } from "src/models/auth.models";
import { Chat } from "src/models/chats/chat.model";


export default function retrieveChat(logger: Logger) {
    return async (id: string, session: AuthSession): Promise<Chat> => {
        const chat = await Chat.retrieve(id);
        if (!chat) {
            throw new Failure("Not found", NOT_FOUND_FAILURE);
        }

        // user has to be a participant
        if (!chat.participants.includes(session.decodedToken.uid)) {
            throw new Failure("Unauthorized", NOT_AUTHORIZED_FAILURE);
        }

        return chat;
    }
}