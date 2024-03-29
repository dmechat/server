import { Logger } from "@nestjs/common";
import { retry } from "rxjs";
import { FirebaseService } from "src/app.service";
import { User } from "src/models/app.models";


export default async function listAvailableUsers(logger: Logger): Promise<User[]> {
    return new Promise((resolve, reject) => {
        FirebaseService.instance.database()
        .ref("users")
        .orderByKey()
        .once("value", (a, b) => {
            let users: User[] = [];
            a.forEach(v => {
                users.push({
                    accountName: v.val().accountName,
                    publicKey: v.key,
                })
            });
            resolve(users);
        });
    })
}