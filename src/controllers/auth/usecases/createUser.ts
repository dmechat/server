import { HttpStatus, Logger } from "@nestjs/common";
import { CreateUserRequest, CreateUserResponse, Failure } from "../../../models/app.models";
import got from 'got';

export default function createUser(logger: Logger) {
    return async (payload: CreateUserRequest): Promise<CreateUserResponse> => {
        try {
            const result = await getFirstResult({ ...payload, initial_device_display_name: payload.initialDeviceDisplayName });
            return result as CreateUserResponse;
        }
        catch (error) {
            throw new Failure(error);
        }
    }
}

async function getFirstResult(payload: any) {
    const MATRIX_HOMESERVER_URL = process.env.MATRIX_HOMESERVER_URL! as string;
    const headers = {
        "accept": "application/json",
        "accept-language": "en-GB,en;q=0.9",
        "content-type": "application/json",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "sec-gpc": "1"
    };
    return new Promise((resolve, reject) => {
        got
            .post(`${MATRIX_HOMESERVER_URL}/_matrix/client/r0/register`, {
                method: "POST",
                body: JSON.stringify(payload),
                headers
            })
            .json()
            .then(data => {
                console.log("data", data)
                resolve(data);
            })
            .catch(async error => {
                console.log("error", error.response.body, error.response.statusCode);
                if (error.response.statusCode == 400) {
                    const body = JSON.parse(error.response.body);
                    reject(body);
                }
                else if (error.response.statusCode == 401) {
                    const auth = JSON.parse(error.response.body);
                    const body = {
                        ...payload, auth: {
                            session: auth.session,
                            type: auth.flows[0].stages[0]
                        }
                    };
                    console.log("second request with", body);
                    const result = await got
                        .post(`${MATRIX_HOMESERVER_URL}/_matrix/client/r0/register`, {
                            method: "POST",
                            body: JSON.stringify(body),
                            headers
                        })
                        .json()
                        .then(result => {
                            console.log("result", result);
                            resolve(result);
                        })
                        .catch(error => {
                            console.log("error, ", error);
                        })
                }
                else {
                    reject(error.response.body);
                }
            });
    });
}
