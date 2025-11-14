// Courses service types
export interface CourseProblem {
  _id: string;
  course_id: string;
  problem_id: string;
  order_index: number;
  is_visible: boolean;
  is_required: boolean;
  createdAt: string;
  updatedAt: string;
  problem: {
    _id: string;
    topic_id: string;
    sub_topic_id: string;
    name: string;
    description: string;
    difficulty: number;
    code_template: string;
    guidelines?: string;
    solution?: string;
    time_limit_ms: number;
    memory_limit_mb: number;
    number_of_tests: number;
    is_public: boolean;
    is_active: boolean;
    problem_type: string;
    topic?: {
      _id: string;
      topic_name: string;
    };
    sub_topic?: {
      _id: string;
      sub_topic_name: string;
    };
    is_done?: boolean;
  };
}

export interface Course {
  _id: string;
  course_name: string;
  course_code: string;
  description: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  created_at: string;
  updated_at: string;
  is_joined?: boolean;
  students?: any[];
  problems?: CourseProblem[];
}

export interface CoursesResponse {
  success: boolean;
  data: Course[];
}

export interface JoinCourseRequest {
  course_id: string;
  student_id: string;
  join_at: string;
}

export interface JoinCourseResponse {
  success: boolean;
  data: any;
}

