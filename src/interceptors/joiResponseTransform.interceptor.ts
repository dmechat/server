import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Schema, attempt } from "joi";
import { map, Observable } from "rxjs";
import { VALIDATION_FAILURE } from "src/models/app.models";
import { DefaultValidationOptions } from "src/pipes/joiValidation.pipe";

export class JoiResponseTransformInterceptor<T> implements NestInterceptor<T, T> {
    constructor(private schema: Schema) {

    }
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T> | Promise<Observable<T>> {
        return next
            .handle()
            .pipe(map(data => {
                const convertedValue = attempt(data, this.schema, VALIDATION_FAILURE, DefaultValidationOptions)
                return convertedValue;
            }));
    }


}