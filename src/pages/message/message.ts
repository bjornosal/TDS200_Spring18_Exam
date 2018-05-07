import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { AngularFirestore } from "angularfire2/firestore";
import { BookListing } from "../../models/BookListing";
import { MessageModel } from "../../models/MessageModel";
import { Conversation } from "../../models/Conversation";
import { User } from "../../models/User";

@IonicPage()
@Component({
  selector: "page-message",
  templateUrl: "message.html"
})
export class MessagePage {
  private bookListing: BookListing = new BookListing("", "", "", null, null);
  private message: MessageModel = new MessageModel(
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    null
  );

  public messageText: string;
  public messageTitle: string;
  private user: User = new User("", "", "");
  private recipient: User = new User("", "", "");

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore
  ) {
    this.bookListing = this.navParams.get("listing");
    this.getCurrentUserFromDatabase();
    this.getRecipientFromDatabase(this.bookListing.seller);
  }

  closeModal() {
    this.navCtrl.pop();
  }

  sendMessage() {
    this.af.collection<MessageModel>("messages").add({
      title: this.messageTitle,
      messageText: this.messageText,
      senderId: this.af.app.auth().currentUser.uid,
      senderName: this.user.name,
      recipientId: this.bookListing.seller,
      recipientName: this.recipient.name,
      bookId: this.bookListing.bookId,
      bookTitle: this.bookListing.title,
      read: false
    } as MessageModel);
    this.closeModal();
  }

  getCurrentUserFromDatabase() {
    this.af
      .collection<User>("users")
      .doc(this.af.app.auth().currentUser.uid)
      .ref.get()
      .then(doc => {
        this.user = doc.data() as User;
      });
  }

  getRecipientFromDatabase(userId: string) {
    
    this.af
      .collection<User>("users")
      .doc(userId)
      .ref.get()
      .then(doc => {
        this.recipient = doc.data() as User;
      });
  }
}
