export interface Toast {
  id: number;
  message: string;
  severity?: 'danger' | 'default' | 'success';
  title?: string;
}
