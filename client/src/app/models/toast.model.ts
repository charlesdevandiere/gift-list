export interface Toast {
  classname: string
  body: string
  delay: number
  callback?: () => void
  button?: string
}
