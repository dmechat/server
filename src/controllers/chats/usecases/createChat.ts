import { Logger } from "@nestjs/common";
import { BAD_REQUEST_FAILURE, Failure } from "src/models/app.models";
import { AuthSession } from "src/models/auth.models";
import { Chat } from "src/models/chats/chat.model";

import { v4 } from "uuid";

export default function createChat(logger: Logger) {
    return async (payload: Chat, session: AuthSession): Promise<Chat> => {
        // provide an id for the chat object
        payload.id = v4();
        payload.createdAt = new Date().getTime();
        payload.createdBy = session.decodedToken.uid;

        // make sure the admin array includes the current session owner
        if (!payload.admins.includes(session.decodedToken.uid)) {
            throw new Failure("user must be an admin to create the chat", BAD_REQUEST_FAILURE);
        }

        // make sure the participants list includes session owner
        if (!payload.participants.includes(session.decodedToken.uid)) {
            throw new Failure("user must be a participant", BAD_REQUEST_FAILURE);
        }

        // JOI
        if (!["private", "group"].includes(payload.type)){
            throw new Failure("type must be private or group", BAD_REQUEST_FAILURE);
        }

        logger.debug("payload for Chat.create", { payload });
        const record = await Chat.create(payload);
        return record;
    }
}