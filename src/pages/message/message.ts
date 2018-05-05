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
  private bookListing: BookListing = new BookListing("", "", "", null, null);
  private message: MessageModel = new MessageModel("", "", "", "", "");
  public messageText: string;
  public messageTitle: string;

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
    if (this.af.app.auth().currentUser != null) {
      this.message.senderId = this.af.app.auth().currentUser.uid;
    }

    console.log("Seller:" + this.bookListing.seller);
    console.log("BookId: " + this.bookListing.bookId);
    console.log("Sender: " + this.message.senderId);

    this.af.collection<MessageModel>("messages").add({
      title: this.messageTitle,
      messageText: this.messageText,
      senderId: (this.message.senderId = this.af.app.auth().currentUser.uid),
      recipientId: this.message.senderId,
      bookId: this.bookListing.bookId
    } as MessageModel);

    this.closeModal();
  }
}
