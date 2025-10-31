import axios from 'axios';

export interface Judge0Language {
  id: number;
  name: string;
}

export const judge0Service = {
  async getLanguages(): Promise<Judge0Language[]> {
    const res = await axios.get<Judge0Language[]>(`https://judge0.ript.vn/languages`);
    return res.data || [];
  },
};


