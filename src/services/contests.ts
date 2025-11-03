import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@/constants';
import { OngoingContestsResponse, Contest, MyContestsResponse, ContestRankingResponse } from './types/contests';

class ContestsService {
  // Get auth token
  private getToken(): string | null {
    return localStorage.getItem('auth-token');
  }

  // Get ongoing contests with pagination and filters
  async getOngoingContests(
    page: number = 1,
    limit: number = 10,
    type: string = 'practice'
  ): Promise<OngoingContestsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add condition parameter as JSON
    const condition = JSON.stringify({ type });
    params.append('condition', condition);

    const token = this.getToken();
    const response = await axios.get<OngoingContestsResponse>(
      `${API_CONFIG.baseURL}${API_ENDPOINTS.contests.ongoing}?${params.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    return response.data;
  }

  // Get contest by ID
  async getContest(id: string): Promise<Contest> {
    const token = this.getToken();
    const response = await axios.get<{ data: Contest; success: boolean }>(
      `${API_CONFIG.baseURL}${API_ENDPOINTS.contests.detail(id)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    return response.data.data;
  }

  // Join a contest
  async joinContest(id: string): Promise<void> {
    const token = this.getToken();
    await axios.post(
      `${API_CONFIG.baseURL}${API_ENDPOINTS.contests.join(id)}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
  }

  // Start a contest (for enrolled users) or enroll and start (for non-enrolled users)
  async startContest(id: string, isEnrolled: boolean = false): Promise<void> {
    const token = this.getToken();
    const body = isEnrolled ? {} : { contest_id: id };
    await axios.post(
      `${API_CONFIG.baseURL}${API_ENDPOINTS.contests.start(id)}`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
  }

  // Get my contests
  async getMyContests(): Promise<MyContestsResponse> {
    const token = this.getToken();
    const response = await axios.get<MyContestsResponse>(
      `${API_CONFIG.baseURL}${API_ENDPOINTS.contests.myContest}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    return response.data;
  }

  // Get contest ranking
  async getContestRanking(contestId: string): Promise<ContestRankingResponse> {
    const token = this.getToken();
    const response = await axios.get<ContestRankingResponse>(
      `${API_CONFIG.baseURL}${API_ENDPOINTS.contests.ranking(contestId)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    return response.data;
  }
}

// Create singleton instance
export const contestsService = new ContestsService();

