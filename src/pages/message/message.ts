import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { AngularFirestore } from "angularfire2/firestore";
import { BookListing } from "../../models/BookListing";
import { MessageModel } from "../../models/MessageModel";

@IonicPage()
@Component({
  selector: "page-message",
  templateUrl: "message.html"
})
export class MessagePage {
  private bookListing: BookListing = new BookListing("", "", "");
  private message: MessageModel = new MessageModel("", "", "", "", "");

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore
  ) {}

  ionViewWillEnter() {
    this.bookListing = this.navParams.get("listing");
  }

  closeModal() {
    this.navCtrl.pop();
  }

  // TODO: SendMessage() here

  sendMessage() {
    
    this.message.recipientId = this.bookListing.seller;
    this.message.senderId = this.af.app.auth().currentUser.uid;
    this.message.bookId

    //TODO: INSERT MODEL OF MESSAGE
    //CurrentUserUid
    //RecipientUserUid
    //Message TODO: need model
    //Listing Book Id TODO: need to add
  }

}
