import { ApiProperty } from "@nestjs/swagger";
import { AwsDocumentClient, GenerateExpressionAttributeNames, GenerateExpressionAttributeValues, GenerateUpdateExpression } from "src/utils/database.client";
import { ChatSettings } from "../chats.models";
import { DbRecord, dbRecordSchema } from "../database.models";

import * as Joi from "joi";
import { JsonRpcProvider } from "near-api-js/lib/providers";
import { keys } from "lodash";
import { StripProps } from "src/utils/helpers";

type ChatType = "self" | "private" | "group";
const CHAT_TYPE_OPTIONS = ["self", "private", "group"];

const createChatSchema = {
    type: Joi.string().valid(...CHAT_TYPE_OPTIONS).required(),
    admins: Joi.array().items(Joi.string()),
    participants: Joi.array().items(Joi.string()),
};

export const CreateChatSchema = Joi.object<Chat>(createChatSchema);

const ChatSchema = Joi.object<Chat>({
    ...createChatSchema,
    ...dbRecordSchema,
    PartitionKey: Joi.string().required().pattern(new RegExp(`Chats`)),
    SortKey: Joi.string().required().pattern(new RegExp(`^Chat#`)),
    id: Joi.string().required()
});

export const ApiChatSchema = Joi.object<Chat>({
    ...createChatSchema,
    ...StripProps(dbRecordSchema, ["PartitionKey", "SortKey"]),
    id: Joi.string().required()
})

export class Chat extends DbRecord {
    @ApiProperty()
    type: ChatType;
    @ApiProperty()
    id: string;
    @ApiProperty()
    admins: string[];
    @ApiProperty()
    participants: string[];

    constructor(input: Chat) {
        super(input);

        this.PartitionKey = `Chats`;
        this.SortKey = `Chat#${input.id}`

        this.type = input.type;
        this.id = input.id;
        this.admins = input.admins;
        this.participants = input.participants;
    }

    static async create(_model: Chat): Promise<Chat> {
        const model = ChatSchema.validate(new Chat(_model)).value;
        const { client, TableName } = AwsDocumentClient();
        const result = await client.transactWrite({
            TransactItems: [
                {
                    "Put": {
                        Item: model,
                        TableName
                    }
                },
                {
                    "Put": {
                        Item: {
                            ...model,
                            PartitionKey: `UserId#${model.createdBy}`,
                        },
                        TableName
                    }
                }
            ]
        }).promise();
        return model;
    }

    static async retrieve(chatId: string): Promise<Chat | undefined> {
        const { client, TableName } = AwsDocumentClient();
        const result = await client.get({
            Key: {
                PartitionKey: `Chats`,
                SortKey: `Chat#${chatId}`
            },
            TableName,
        }).promise();
        console.log("result", result);
        if (!result.Item) {
            return null;
        }
        return new Chat(result.Item as Chat);
    }

    static async update(_model: Chat): Promise<Chat> {
        const model = ChatSchema.validate(new Chat(_model)).value;
        const { client, TableName } = AwsDocumentClient();
        const result = await client.transactWrite({
            TransactItems: [
                {
                    "Update": {
                        Key: {
                            PartitionKey: model.PartitionKey,
                            SortKey: model.SortKey
                        },
                        TableName,
                        UpdateExpression: `set ${GenerateUpdateExpression(model)}`,
                        ExpressionAttributeNames: GenerateExpressionAttributeNames(model),
                        ExpressionAttributeValues: GenerateExpressionAttributeValues(model)
                    }
                },
                {
                    "Update": {
                        Key: {
                            PartitionKey: `UserId#${model.createdBy}`,
                            SortKey: `ChatId${model.id}`
                        },
                        TableName,
                        UpdateExpression: `set ${GenerateUpdateExpression(model)}`,
                        ExpressionAttributeNames: GenerateExpressionAttributeNames(model),
                        ExpressionAttributeValues: GenerateExpressionAttributeValues(model)
                    }
                }
            ]
        }).promise();
        return model;
    }
}
