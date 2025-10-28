// Courses service types
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
}

export interface CoursesResponse {
  success: boolean;
  data: Course[];
}

