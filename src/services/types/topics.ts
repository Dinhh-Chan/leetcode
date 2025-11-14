export interface TopicItem {
  _id: string;
  topic_name: string;
  description?: string;
  order_index?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TopicsManyApiResponse {
  success: boolean;
  data: TopicItem[];
}
