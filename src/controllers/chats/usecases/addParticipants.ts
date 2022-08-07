import { Logger } from "@nestjs/common";
import { remove, uniq } from "lodash";
import { Failure, NOT_AUTHORIZED_FAILURE, NOT_FOUND_FAILURE } from "src/models/app.models";
import { AuthSession } from "src/models/auth.models";
import { Chat } from "src/models/chats/chat.model";
import { UpdateParticipantsRequest } from "src/models/chats/participants.model";

export default function addParticipants(logger: Logger) {
    return async (id: string, payload: UpdateParticipantsRequest, session: AuthSession): Promise<boolean> => {
        const chat = await Chat.retrieve(id);
        if (!chat) {
            throw new Failure("not found", NOT_FOUND_FAILURE);
        }

        if (!chat.admins.includes(session.decodedToken.uid)) {
            throw new Failure("not authorized", NOT_AUTHORIZED_FAILURE);
        }
        chat.participants = uniq(chat.participants.concat(payload.addParticipants));
        payload.removeParticipants.forEach(p => {
            remove(chat.participants, (participant) => participant == p)
        });
        chat.updatedAt = new Date().getTime();
        chat.updatedBy = session.decodedToken.uid;

        await Chat.update(chat);

        return true;
    }
}