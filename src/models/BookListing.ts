export class BookListing {
  constructor(
    public title: string,
    public description: string,
    public uid: string,
    public price?: number,
    public photos?: string[]
  ) {}
}
