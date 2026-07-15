// category.ts
export interface Category {
  id: number; // bigint in PostgreSQL maps to number in TS
  category: string;
  user_id: string; // uuid
  created_at: string;
}