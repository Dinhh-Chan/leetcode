import axios from 'axios';

export interface Judge0Language {
  id: number;
  name: string;
}

export interface BatchSubmission {
  language_id: number;
  source_code: string;
  stdin: string;
  expected_output: string;
}

export interface BatchSubmissionRequest {
  submissions: BatchSubmission[];
}

export interface Status {
  id: number;
  description: string;
}

export interface BatchSubmissionResponse {
  stdout: string | null;
  time: string | null;
  memory: number | null;
  stderr: string | null;
  token: string;
  compile_output: string | null;
  message: string | null;
  status: Status;
}

export interface BatchSubmissionsResponse {
  submissions: BatchSubmissionResponse[];
}

export interface TokenResponse {
  token: string;
}

export const judge0Service = {
  async getLanguages(): Promise<Judge0Language[]> {
    const res = await axios.get<Judge0Language[]>(`https://judge0.ript.vn/languages`);
    return res.data || [];
  },
  
  async submitBatch(submissions: BatchSubmission[]): Promise<TokenResponse[]> {
    const res = await axios.post<TokenResponse[]>(
      `https://judge0.ript.vn/submissions/batch?base64_encoded=false`,
      { submissions }
    );
    return res.data;
  },
  
  async getBatchResults(tokens: string[]): Promise<BatchSubmissionsResponse> {
    const tokensParam = tokens.join(',');
    const res = await axios.get<BatchSubmissionsResponse>(
      `https://judge0.ript.vn/submissions/batch?tokens=${tokensParam}&base64_encoded=false`
    );
    return res.data;
  },
};


