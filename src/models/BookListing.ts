import { Condition } from "./enums/enums";

export class BookListing {
  bookId: string;

  constructor(
    public title: string,
    public description: string,
    public seller: string,
    public condition: Condition,
    public price: number,
    public sold: boolean,
    public address?: string,
    public photos?: string[]
  ) {}
}
