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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore
  ) {
    this.setAllBookListingsCollection();
    this.setBookListingObservableOnCollection();
  }

  ionViewDidEnter() {
    //TODO implement select on tabs
  }

  setAllBookListingsCollection() {
    this.allBookListingsCollection = this.af.collection<BookListing>(
      "bookListings"
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
}
