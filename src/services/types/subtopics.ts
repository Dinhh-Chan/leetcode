// Sub-topics API types

export interface SubTopicItem {
  _id: string;
  topic_id: string;
  sub_topic_name: string;
  description?: string;
  lo?: string;
  order_index?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubTopicsManyApiResponse {
  success: boolean;
  data: SubTopicItem[];
}









