// Types for restore API
export interface RestoreRequest {
    backup: string;
    namespace: string;
    nodeName: string;
}

export interface RestoreResponse {
    message?: string;
    error?: string;
    details?: string;
} 