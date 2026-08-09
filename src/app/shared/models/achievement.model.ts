export interface Achievement {
  id: string;
  text: string;
  createdAt: string;
  tags?: string[];
  categoryId?: string | null;
}
