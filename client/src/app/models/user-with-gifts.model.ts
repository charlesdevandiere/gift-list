import { Gift } from "./gift.model";
import { User } from "./user.model";

export interface UserWithGifts extends User {
  gifts: Gift[];
}
