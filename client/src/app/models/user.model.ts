import { Gift } from "./gift.model";

export interface User {
  id: string;
  name: string;
  picture: string | null;
}

export interface UserWithGifts extends User {
  gifts: Gift[];
}
