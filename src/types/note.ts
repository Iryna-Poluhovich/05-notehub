export interface Note {
  id: string;
  title: string;
  content: string;
  tag: "Todo" | "Work" | "Personal" | "Meeting" | "Shopping";
  createdAt: string;
}

export interface PaginatedNotes {
  notes: Note[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}