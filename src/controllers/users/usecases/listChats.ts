import { Logger } from "@nestjs/common";
import { Failure, NOT_AUTHORIZED_FAILURE, NOT_FOUND_FAILURE } from "src/models/app.models";
import { AuthSession } from "src/models/auth.models";
import { Chat } from "src/models/chats/chat.model";
import { ListMessagesQuery, Message } from "src/models/chats/message.model";

export default function listChats(logger: Logger) {
    return async (uid: string, session: AuthSession): Promise<Chat[]> => {
        if (uid != session.decodedToken.uid){
            throw new Failure("not authorized", NOT_AUTHORIZED_FAILURE);
        }

        const chats = await Chat.listUserChats(uid);

        return chats;
    }
}