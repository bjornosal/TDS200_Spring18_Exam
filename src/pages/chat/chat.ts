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
  public messageTitle: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private modalCtrl: ModalController
  ) {
    this.setAllMessagesCollection();
    this.setAllMessageObservableOnCollection();

    this.conversation = navParams.get("conversation");
    this.bookId = this.conversation.listing;
    this.senderId = this.conversation.sender;

    this.getBookFromDatabase(this.conversation.listing);
  }

  setAllMessagesCollection() {
    this.allMessages = this.af.collection<MessageModel>("messages", ref => {
      return ref.orderBy('created')
    });
  }

  setAllMessageObservableOnCollection() {
    this.messages = this.allMessages.snapshotChanges().map(actions => {
      
      return actions.map(action => {
        let data = action.payload.doc.data() as MessageModel;
        let id = action.payload.doc.id;
        
        if(data.senderId != this.af.app.auth().currentUser.uid) {
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
      });
  }
}
