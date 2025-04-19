export interface User {
  id: number;
  username: string;
  role: string;
}

export interface Bug {
  id: number;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved";
  priority: "Low" | "Medium" | "High";
  created_at: string;
  updated_at: string;
  created_by: number;
  assigned_to: number | null;
  created_by_username?: string;
  assigned_to_username?: string;
}

export interface Comment {
  id: number;
  bug_id: number;
  user_id: number;
  content: string;
  created_at: string;
  username?: string;
}
