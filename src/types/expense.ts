export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  note?: string | null;
  created_at: string;
}
