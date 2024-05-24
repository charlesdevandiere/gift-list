export interface ConfirmModalData {
  message: string,
  yesButton: {
    color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info',
    value: string
  }
  noButton?: {
    color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info',
    value: string
  }
}
