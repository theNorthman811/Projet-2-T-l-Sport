// Olympic.ts
import { Participation } from "./Participation";


export interface olympic {
  id: number;
  country: string;
  participations: Participation[];
}
