import axios from 'axios';
import { API_CONFIG } from '@/constants';
import { apiClient } from './api';

export interface ProfileLanguage {
  language: string;
  problems_solved: number;
}

export interface ProfileRecentAC {
  problem_id: string;
  problem_name: string;
  solved_at: string;
}

export interface ProfileSkill {
  sub_topic_id: string;
  sub_topic_name: string;
  problems_solved: number;
}

export interface DifficultyStats {
  solved: number;
  total: number;
}

export interface UserProfileResponse {
  success: boolean;
  data: {
    rank: number;
    username: string;
    fullname: string;
    easy_ac: DifficultyStats;
    medium_ac: DifficultyStats;
    hard_ac: DifficultyStats;
    languages: ProfileLanguage[];
    recent_ac: ProfileRecentAC[];
    skills: ProfileSkill[];
  };
}

export const profileService = {
  async getProfile(userId?: string): Promise<UserProfileResponse['data']> {
    const url = userId 
      ? `/user/profile-me/${userId}`
      : '/user/profile-me/user';
    
    const res = await apiClient.get<UserProfileResponse>(url);
    return res.data.data;
  },
};

