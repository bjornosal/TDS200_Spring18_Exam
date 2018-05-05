export class BookListing {
  bookId: string;
  
  constructor(
    //TODO: listing
    public title: string,
    public description: string,
    public seller: string,
    public price?: number,
    public photos?: string[]
  ) {}
}
