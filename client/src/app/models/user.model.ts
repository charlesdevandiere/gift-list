import { Gift } from "./gift.model";

export interface User {
  id: string;
  name: string;
  picture: string | null;
  gifts?: Gift[];
}
