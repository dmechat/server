import { ApiProperty } from "@nestjs/swagger";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { AwsDocumentClient } from "src/utils/database.client";
import { DbRecord, dbRecordSchema } from "../database.models";
import * as Joi from "joi";
import { StripProps } from "src/utils/helpers";

type MessageType = "text" | "audio" | "file" | "video";
const MESSAGE_TYPE_OPTIONS = ["text", "audio", "file", "video"];

const createMessageSchema = {
    chatId: Joi.string().required(),
    senderId: Joi.string().required(),
    type: Joi.string().valid(...MESSAGE_TYPE_OPTIONS),
    contents: Joi.object<MessageContents>({
        path: Joi.string(),
        text: Joi.string()
    })
};

export const CreateMessageSchema = Joi.object<Message>(createMessageSchema);

export const UpdateMessageSchema= Joi.object<Message>({
    ...createMessageSchema,
    id: Joi.string().required()
});

export const MessageSchema = Joi.object<Message>({
    ...createMessageSchema,
    ...StripProps(dbRecordSchema, ["PartitionKey", "SortKey"]),
    PartitionKey: Joi.string().required().pattern(new RegExp(`^Chat#`)),
    SortKey: Joi.string().required().pattern(new RegExp(`^Message#`)),
    id: Joi.string().required()
});

export const ApiMessageSchema = Joi.object<Message>({
    ...createMessageSchema,
    ...StripProps(dbRecordSchema, ["PartitionKey", "SortKey"]),
    id: Joi.string().required()
});

export const ApiMessageListSchema = Joi.array().items(ApiMessageSchema);

export class MessageContents {
    @ApiProperty()
    text: string;
    @ApiProperty()
    path: string;
}

export class Message extends DbRecord {
    @ApiProperty()
    chatId: string;
    @ApiProperty()
    id: string;
    @ApiProperty()
    senderId: string;
    @ApiProperty()
    edited: boolean;
    @ApiProperty()
    type: MessageType;
    @ApiProperty()
    contents: MessageContents;

    constructor(input: Message) {
        super(input);

        // .. partition key
        this.PartitionKey = `Chat#${input.chatId}`;
        this.SortKey = `Message#${input.id}`;

        this.id = input.id;
        this.chatId = input.chatId;
        this.senderId = input.senderId;
        this.edited = input.edited;
        this.type = input.type;
        this.contents = input.contents;
    }

    static async save(message: Message): Promise<Message> {
        const model = MessageSchema.validate(new Message(message)).value;
        const { client, TableName } = AwsDocumentClient();
        const result = await client.transactWrite({
            TransactItems: [
                {
                    "Put": {
                        Item: model,
                        TableName
                    }
                }
            ]
        }).promise();
        return model;
    }

    static async retrieve(chatId: string, messageId: string): Promise<Message> {
        const { client, TableName } = AwsDocumentClient();
        const result = await client.get(
            {
                Key: {
                    PartitionKey: `Chat#${chatId}`,
                    SortKey: `Message#${messageId}`
                },
                TableName
            }
        ).promise();
        if (!result.Item) {
            return null;
        }
        return new Message(result.Item as Message);
    }

    // static async update(chatId: string, messageId: string): Promise<Message> {

    // }

    static async list(chatId: string, query: ListMessagesQuery): Promise<Message[]> {
        const { client, TableName } = AwsDocumentClient();
        let dbQuery = {
            TableName,
            Limit: query.limit,
            KeyConditionExpression: `PartitionKey = :pkey and begins_with(SortKey, :skey)`,
            ExpressionAttributeValues: {
                ':pkey': `Chat#${chatId}`,
                ':skey': `Message#`,
            },
            ScanIndexForward: query.order == "asc"
        } as DocumentClient.QueryInput;

        const filterExpressionParts = [];

        if (query.after) {
            filterExpressionParts.push(`createdAt >= :after`);
            // TODO: joi
            dbQuery.ExpressionAttributeValues[":after"] = parseInt(query.after as any);
        }
        if (query.before) {
            filterExpressionParts.push(`createdAt <= :before`);
            // TODO: joi
            dbQuery.ExpressionAttributeValues[":before"] = parseInt(query.before as any);
        }

        if (filterExpressionParts.length > 0) {
            dbQuery.FilterExpression = filterExpressionParts.join(" and ")
        }

        console.log("query with ", dbQuery);

        const result = await client.query(dbQuery).promise();
        return result.Items.map(item => new Message(item as Message));
    }
}

export const DefaultListMessagesQueryLimit = 50;

type QueryOrder = "asc" | "desc";
const ORDER_OPTIONS = ["asc", "desc"];
const DefaultOrder = "desc";
export const ListMessagesQuerySchema = Joi.object<ListMessagesQuery>({
    after: Joi.number(),
    before: Joi.number(),
    limit: Joi.number()
        .default(DefaultListMessagesQueryLimit)
        .min(1)
        .max(100),
    order: Joi.string().valid(...ORDER_OPTIONS).default(DefaultOrder)
});

export type ListMessagesQuery = {
    limit?: number;
    before?: number;
    after?: number;
    order?: QueryOrder;
}