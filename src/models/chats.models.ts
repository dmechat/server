import { ApiProperty } from "@nestjs/swagger";
import { DbRecord } from "../models/database.models";

export class ChatSettings {
    // for example: 
    // @ApiProperty()
    // paused: boolean; 
    // @ApiProperty()
    // slowMode: {time: number, status: boolean}; 
}


export class InviteUser {
    uid: string;
    chatId: string;
}