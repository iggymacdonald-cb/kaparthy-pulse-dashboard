export interface Author {
  username: string;
  avatar_url?: string;
}

export interface Post {
  id: number;
  content: string;
  author: Author;
  created_at: string;
  parent_post_id?: number | null;
}
