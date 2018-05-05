import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ModalController
} from "ionic-angular";
import { BookListing } from "../../models/BookListing";
import { AngularFirestore } from "angularfire2/firestore";
import { MessagePage } from "../message/message";

@IonicPage()
@Component({
  selector: "page-listing",
  templateUrl: "listing.html"
})
export class ListingPage {
  private bookListing: BookListing = new BookListing("", "", "");


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private modalCtrl: ModalController
  ) {}

  ionViewWillEnter() {
    this.bookListing = this.navParams.get("listing");
  }

  presentMessageModal() {
    let messageModal = this.modalCtrl.create(MessagePage, {
      listing: this.navParams.get("listing")
    });
    messageModal.present();
  }

  isCurrentUserLoggedIn():boolean  {
    return this.af.app.auth().currentUser != null
  }

  isListingByCurrentUser(): boolean {
    if (this.af.app.auth().currentUser != null) {
      return this.bookListing.seller == this.af.app.auth().currentUser.uid;
    } else {
      return false;
    }
  }
}
