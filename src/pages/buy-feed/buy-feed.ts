import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  MenuController
} from "ionic-angular";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "angularfire2/firestore";
import { BookListing } from "../../models/BookListing";
import { Observable } from "rxjs/Observable";
import { ListingPage } from "../listing/listing";

@IonicPage()
@Component({
  selector: "page-buy-feed",
  templateUrl: "buy-feed.html"
})
export class BuyFeedPage {
  private allBookListingsCollection: AngularFirestoreCollection<BookListing>;
  private bookListings: Observable<BookListing[]>;
  private filterIsOpen = false;

  private priceRange = {
    lower: 0,
    upper: 2000
  };

  private filterSearch: string = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore
  ) {
    this.setAllBookListingsCollection();
    this.setBookListingObservableOnCollection();
  }
  /**
   * Gets an AngularFireStoreCollection on the booklistings collection
   * @returns void
   */
  private setAllBookListingsCollection():void {
    this.allBookListingsCollection = this.af.collection<BookListing>("bookListings",
      ref => {
        return ref.where("sold", "==", false).orderBy("created");
      }
    );
  }
  /**
   * Sets an observable on the booklistings AngularFireStoreCollection
   * @returns void
   */
  private setBookListingObservableOnCollection():void {
    this.bookListings = this.allBookListingsCollection
      .snapshotChanges()
      .map(actions => {
        return actions.map(action => {
          let data = action.payload.doc.data() as BookListing;
          let id = action.payload.doc.id;
          data.bookId = id;
          return {
            id,
            ...data
          };
        });
      });
  }
  /**
   * Navigates to a given listing
   * @param  {BookListing} listing
   * @returns void
   */
  private goToListing(listing: BookListing):void {
    this.filterIsOpen = false;
    this.navCtrl.push(ListingPage, {
      listing: listing
    });
  }
  /**
   * Checks if a listing passes given filter
   * @param  {BookListing} listing to check
   * @returns boolean if passes
   */
  private checkIfListingPassesFilter(listing: BookListing): boolean {
    let passes: boolean = false;

    if (this.filterSearch !== null) {
      if (
        (listing.title
          .toLocaleLowerCase()
          .includes(this.filterSearch.toLocaleLowerCase()) ||
          listing.isbn
            .toLocaleLowerCase()
            .includes(this.filterSearch.toLocaleLowerCase())) &&
        this.priceRange.lower <= listing.price &&
        listing.price <= this.priceRange.upper
      ) {
        passes = true;
      }
    }
    return passes;
  }

  private openFilters():void {
    this.filterIsOpen = !this.filterIsOpen;
  }

  private getFilterIsOpen():boolean {
    return this.filterIsOpen;
  }
}
