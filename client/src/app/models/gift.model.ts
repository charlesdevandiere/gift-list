export interface Gift {
  id: string;
  name: string;
  link1: string | null;
  link2: string | null;
  link3: string | null;
  user_id: string;
  offered_by?: string;
}
