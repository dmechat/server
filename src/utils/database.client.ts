import { Keyspaces } from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { keys } from "lodash";

// TODO: We need to create a generic database interface that's not directly dynamodb
export function AwsDocumentClient() {
    const region = process.env.REGION;
    const apiVersion = "2012-08-10";
    return {
        client: new DocumentClient({
            apiVersion, region
        }),
        TableName: process.env.DYNAMODB_TABLE_NAME
    }
}

const propsToIgnore = [`PartitionKey`, `SortKey`];
export function GenerateUpdateExpression(object: any) {
    return keys(object)
        .filter(prop => !propsToIgnore.includes(prop))
        .map(key => `#${(key)} = :${key}`).join(",");
}

export function GenerateExpressionAttributeNames(object: any) {
    return keys(object)
        .filter(key => !propsToIgnore.includes(key))
        .map(key => {
            const o = {} as any;
            o[`#${key}`] = key;
            return o;
        })
        .reduce((a, b) => Object.assign(a, b), {});
}

export function GenerateExpressionAttributeValues(object: any) {
    return keys(object)
        .filter(key => !propsToIgnore.includes(key))
        .map(key => {
            const o = {} as any;
            o[`:${key}`] = object[key];
            return o;
        })
        .reduce((a, b) => Object.assign(a, b), {});
}