export interface OllamaResponse {
    model: string;
    created_at: string;
    message: {
        role: string;
        content: string;
    };
    done: boolean;
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
}

export interface OllamaModel {
    name: string;
    size: number;
    digest: string;
    details: {
        format: string;
        family: string;
        families?: string[];
        parameter_size: string;
        quantization_level: string;
    };
    modified_at: string;
}