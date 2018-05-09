import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ModalController
} from "ionic-angular";
import { MessageModel } from "../../models/MessageModel";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "angularfire2/firestore";
import { Observable } from "rxjs/Observable";
import { Conversation } from "../../models/Conversation";
import { MessagePage } from "../message/message";
import { BookListing } from "../../models/BookListing";
import { User } from "../../models/User";
import * as firebase from "firebase";

@IonicPage()
@Component({
  selector: "page-chat",
  templateUrl: "chat.html"
})
export class ChatPage {
  private listing: BookListing = new BookListing("", "", "", null, null, null);

  private allMessages: AngularFirestoreCollection<MessageModel>;
  private messages: Observable<MessageModel[]>;

  private bookId: string = "";
  private senderId: string;
  private conversation: Conversation;
  public messageText: string;

  private user: User = new User("", "", "");
  private recipient: User = new User("", "", "");

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private modalCtrl: ModalController
  ) {
  
  }

  ionViewWillEnter() {
    this.setAllMessagesCollection();
    this.setAllMessageObservableOnCollection();
    this.getCurrentUserFromDatabase();

    this.conversation = this.navParams.get("conversation");
    this.bookId = this.conversation.listing;
    this.senderId = this.conversation.sender;
    this.getBookFromDatabase(this.conversation.listing);
    this.messages.subscribe();
  }
  setAllMessagesCollection() {
    this.allMessages = this.af.collection<MessageModel>("messages", ref => {
      return ref.orderBy("created");
    });
  }

  setAllMessageObservableOnCollection() {
    this.messages = this.allMessages.snapshotChanges().map(actions => {
      return actions.map(action => {
        let data = action.payload.doc.data() as MessageModel;
        let id = action.payload.doc.id;

        if (data.senderId != this.af.app.auth().currentUser.uid) {
          this.setMessageToRead(id);
        }

        if (
          (data.senderId === this.senderId ||
            data.recipientId === this.senderId) &&
          data.bookId === this.bookId
        ) {
          return {
            id,
            ...data
          };
        }
      });
    });
  }

  setMessageToRead(messageId: string) {
    this.af
      .collection<MessageModel>("messages")
      .doc(messageId)
      .update({
        read: true
      } as MessageModel);
  }

  presentMessageModal() {
    this.modalCtrl
      .create(MessagePage, {
        listing: this.listing
      })
      .present();
  }

  getBookFromDatabase(bookId: string) {
    this.af
      .collection<BookListing>("bookListings")
      .doc(bookId)
      .ref.get()
      .then(doc => {
        this.listing = doc.data() as BookListing;
        this.listing.bookId = bookId;
      })
      .then(res => {
        this.getRecipientFromDatabase(this.listing.seller);
      });
  }

  sendMessage() {
    this.af.collection<MessageModel>("messages").add({
      messageText: this.messageText,
      senderId: this.af.app.auth().currentUser.uid,
      senderName: this.user.name,
      recipientId: this.listing.seller,
      recipientName: this.recipient.name,
      bookId: this.listing.bookId,
      bookTitle: this.listing.title,
      read: false,
      created: firebase.firestore.FieldValue.serverTimestamp()
    } as MessageModel);
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

  closeModal() {
    this.navCtrl.pop();
  }
}
