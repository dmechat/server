import { ArgumentMetadata, BadRequestException, Injectable, Logger, Paramtype, PipeTransform } from "@nestjs/common";
import { ObjectSchema, ValidationOptions } from "joi";
import { mapValues } from "lodash";

export const DefaultValidationOptions: ValidationOptions = {
    stripUnknown: true,
    errors: { wrap: { label: "[]" } },
    convert: true,
}

@Injectable()
export class JoiValidationPipe implements PipeTransform {
    private logger: Logger;
    constructor(private schema: ObjectSchema, private paramType: Paramtype) {
        this.logger = new Logger(JoiValidationPipe.name);
    }

    transform(incomingValue: any, metadata: ArgumentMetadata) {
        if (metadata.type == this.paramType) {
            const { error, value } = this.schema.validate(incomingValue, DefaultValidationOptions);
            if (error) {
                throw new BadRequestException(error.message);
            }
            return value;
        }
        return incomingValue;
    }
}