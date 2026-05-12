import type { ApiResponseOptions } from '@nestjs/swagger';

export function ok(data: any, description = 'Success'): ApiResponseOptions {
    return {
        description,
        schema: {
            example: { data, message: 'Success', statusCode: 200 },
        },
    };
}

export function created(data: any, description = 'Created'): ApiResponseOptions {
    return {
        description,
        schema: {
            example: { data, message: 'Success', statusCode: 200 },
        },
    };
}

export function errorResponse(status: number, message: string): ApiResponseOptions {
    return {
        status,
        description: message,
        schema: {
            example: { success: false, message, data: null },
        },
    };
}
