export interface HttpResponse {
    status?: 'success' | 'error';
    message?: string;
    data?: any;
}

export function successResponse(data?: any): HttpResponse {
    return ({
        ...data,
    });
}

export function errorResponse(data?: Record<string, any>): HttpResponse {
    return ({
        ...data,
    });
}