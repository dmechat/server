import { ApiProperty } from "@nestjs/swagger";
import * as Joi from "joi";

export const dbRecordSchema = {
    PartitionKey: Joi.string().required(),
    SortKey: Joi.string().required(),
    createdAt: Joi.number().required(),
    createdBy: Joi.string().required(),
    updatedAt: Joi.number(),
    updatedBy: Joi.string(),
};
export const DbRecordSchema = Joi.object<DbRecord>(dbRecordSchema);

export class DbRecord {
    PartitionKey: string;
    SortKey: string;
    @ApiProperty()
    createdAt: number;
    @ApiProperty()
    updatedAt: number;
    @ApiProperty()
    createdBy: string;
    @ApiProperty()
    updatedBy: string;

    constructor(input: DbRecord) {
        this.PartitionKey = input.PartitionKey;
        this.SortKey = input.SortKey;
        this.createdAt = input.createdAt;
        this.updatedAt = input.updatedAt;
        this.createdBy = input.createdBy;
        this.updatedBy = input.updatedBy;
    }
}
