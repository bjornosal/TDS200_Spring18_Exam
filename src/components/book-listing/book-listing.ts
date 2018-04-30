import { Component, Input } from '@angular/core';


@Component({
  selector: 'book-listing',
  templateUrl: 'book-listing.html'
})
export class BookListingComponent {
  
  @Input()
  private listingImage:string; 

  @Input()
  private bookListingTitle:string;

  @Input()
  private bookListingDescription:string;
  
  @Input()
  private bookListingPrice:string;
  
  constructor() {
  }

}
