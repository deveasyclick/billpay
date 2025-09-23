import type { Biller } from './biller';

export interface Category {
  Id: number;
  Name: string;
  Description: string;
  Billers: Biller[];
}
