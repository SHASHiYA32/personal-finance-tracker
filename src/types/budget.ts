export interface Budget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  month: number;
  year: number;
  created_at: string;
}
