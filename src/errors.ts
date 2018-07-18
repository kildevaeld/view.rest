import { isString } from "@viewjs/utils";

export enum RestErrorCode {
    Unknown, MissingURL
}

export class RestError extends Error {
    constructor(public message: string = "", public code: RestErrorCode) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export function createError(code: RestErrorCode | string, message?: string) {
    if (isString(code)) {
        message = code
        code = RestErrorCode.Unknown;
    }
    return new RestError(message, code);
}
