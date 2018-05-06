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
import { MessageModel } from "../../models/MessageModel";
import { LoginPage } from "../login/login";
import { EditListingPage } from "../edit-listing/edit-listing";

@IonicPage()
@Component({
  selector: "page-listing",
  templateUrl: "listing.html"
})
export class ListingPage {
  private bookListing: BookListing = new BookListing("", "", "", null, null);
  private openedAsModal: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private modalCtrl: ModalController
  ) {}

  ionViewWillEnter() {
    this.bookListing = this.navParams.get("listing");
    if (this.navParams.get("modal") == true) {
      this.openedAsModal = this.navParams.get("modal");
    }
  }

  presentMessageModal() {
    let messageModal = null;

    if (this.isCurrentUserLoggedIn()) {
      messageModal = this.modalCtrl.create(MessagePage, {
        listing: this.navParams.get("listing")
      });
    } else {
      messageModal = this.modalCtrl.create(LoginPage, {
        fromPage: "contact"
      });
    }
    messageModal.present();
  }

  presentEditModal() {
    let editModal = null;
    console.log(this.navParams.get("listing"));

    editModal = this.modalCtrl
      .create(EditListingPage, {
        listing: this.navParams.get("listing")
      })
      .present();
  }

  private isCurrentUserLoggedIn(): boolean {
    return this.af.app.auth().currentUser != null;
  }

  isListingByCurrentUser(): boolean {
    if (this.af.app.auth().currentUser != null) {
      return this.bookListing.seller == this.af.app.auth().currentUser.uid;
    } else {
      return false;
    }
  }

  isOpenedByModal(): boolean {
    return this.openedAsModal;
  }

  closeModal() {
    this.navCtrl.pop();
  }
}
