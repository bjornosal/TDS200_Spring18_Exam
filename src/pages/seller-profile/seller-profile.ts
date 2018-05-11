import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { User } from "../../models/User";
import { Observable } from "rxjs/Observable";
import { BookListing } from "../../models/BookListing";
import {
  AngularFirestoreCollection,
  AngularFirestore
} from "angularfire2/firestore";
import { ListingPage } from "../listing/listing";

@IonicPage()
@Component({
  selector: "page-seller-profile",
  templateUrl: "seller-profile.html"
})
export class SellerProfilePage {
  private user: User = new User("", "", "");
  private allListings: AngularFirestoreCollection<BookListing>;
  private listings: Observable<BookListing[]>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore
  ) {
    this.getSellerFromDatabase(this.navParams.get("seller"));
  }

  private getAllListingsByUser(seller: string): void {
    this.allListings = this.af.collection<BookListing>("bookListings", ref => {
      return ref.where("seller", "==", seller);
    });

    this.listings = this.allListings.snapshotChanges().map(actions => {
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

  private getSellerFromDatabase(seller: string): void {
    this.af
      .collection<User>("users")
      .doc(seller)
      .ref.get()
      .then(doc => {
        this.user = doc.data() as User;
      })
      .then(res => {
        this.getAllListingsByUser(seller);
      });
  }

  private goToListing(listing: BookListing): void {
    this.navCtrl.push(ListingPage, {
      listing: listing
    });
  }
}
