// Contests service types
export interface ContestUser {
  [key: string]: any;
}

export interface ContestProblem {
  [key: string]: any;
}

export interface Contest {
  _id: string;
  contest_name: string;
  description: string;
  start_time: string;
  end_time: string;
  created_time: string;
  is_active: boolean;
  duration_minutes: number;
  max_problems: number;
  order_index: number;
  type: string;
  contest_users?: ContestUser[];
  contest_problems?: ContestProblem[];
  is_enrolled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OngoingContestsData {
  result: Contest[];
  total: number;
  skip: number;
  limit: number;
  page: number;
}

export interface OngoingContestsResponse {
  data: OngoingContestsData;
  success: boolean;
}

export interface MyContestItem {
  contest: Contest;
  status: 'enrolled' | 'pending';
  is_manager: boolean;
  accepted_count: number;
  contest_user_id: string;
}

export interface MyContestsData {
  total: number;
  result: MyContestItem[];
}

export interface MyContestsResponse {
  data: MyContestsData;
  success: boolean;
}

