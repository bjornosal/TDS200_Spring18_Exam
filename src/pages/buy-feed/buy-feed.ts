import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
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

  private filterPriceStart: number = 0;
  private filterPriceEnd: number = 2000;
  private filterSearch: string = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore
  ) {
    this.setAllBookListingsCollection();
    this.setBookListingObservableOnCollection();
  }

  setAllBookListingsCollection() {
    this.allBookListingsCollection = this.af.collection<BookListing>(
      "bookListings",
      ref => {
        return ref.where("sold", "==", false);
      }
    );
  }

  setBookListingObservableOnCollection() {
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

  goToListing(listing: BookListing) {
    this.navCtrl.push(ListingPage, {
      listing: listing
    });
  }

  checkIfListingPassesFilter(listing: BookListing): boolean {
    let found: boolean = false;

    if (this.filterSearch !== null) {
      if (
        listing.title
          .toLocaleLowerCase()
          .includes(this.filterSearch.toLocaleLowerCase()) &&
        this.filterPriceStart <= listing.price &&
        listing.price <= this.filterPriceEnd
      ) {
        found = true;
      }
    }

    return found;
  }
}
