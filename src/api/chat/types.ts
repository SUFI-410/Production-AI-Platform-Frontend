export interface ChatRequest {
  question: string;
  session_id?: string | null;
  use_cache?: boolean;
}

export interface Source {
  document: string;
  score: number;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
  grounded: boolean;
  session_id: string | null;
}
