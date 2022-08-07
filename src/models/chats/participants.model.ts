import { ApiProperty } from "@nestjs/swagger";
import * as Joi from "joi";

export class UpdateParticipantsRequest {
    @ApiProperty()
    addParticipants: string[]
    @ApiProperty()
    removeParticipants: string[]
}

export const UpdateParticipantsRequestSchema = Joi.object<UpdateParticipantsRequest>({
    addParticipants: Joi.array().items(Joi.string()),
    removeParticipants: Joi.array().items(Joi.string())
});