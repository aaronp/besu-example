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
export interface ClearRequest {
    namespace: string;
    nodeName: string;
}
export interface ClearResponse {
    message?: string;
    error?: string;
    details?: string;
} 