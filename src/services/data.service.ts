import { Injectable } from "@nestjs/common";

interface IDataService {
    // create<T>(record: Record): Promise<T>;
    // retrieve<T>(record: Record): Promise<T>;
    // update<T>(record: Record): Promise<T>;
    // delete(record: Record): Promise<boolean>;
    // list<T>(partitionKey: string): Promise<T[]>;
}

// TODO: this uses dynamodb, but since the table structure is small, we can use sqlite later on
@Injectable()
export class DataService implements IDataService {
    // create<T>(record: Record): Promise<T> {
    //     throw new Error("Method not implemented.");
    // }
    // retrieve<T>(record: Record): Promise<T> {
    //     throw new Error("Method not implemented.");
    // }
    // update<T>(record: Record): Promise<T> {
    //     throw new Error("Method not implemented.");
    // }
    // delete(record: Record): Promise<boolean> {
    //     throw new Error("Method not implemented.");
    // }
    // list<T>(partitionKey: string): Promise<T[]> {
    //     throw new Error("Method not implemented.");
    // }
}