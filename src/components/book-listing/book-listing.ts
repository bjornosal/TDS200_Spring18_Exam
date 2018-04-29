import { Component, Input } from '@angular/core';


@Component({
  selector: 'book-listing',
  templateUrl: 'book-listing.html'
})
export class BookListingComponent {

  private bookListingTitle:string;
  private listingImage:string = '../../assets/imgs/logo.png'; 
  
  constructor() {
  }

}
