import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "angularfire2/firestore";
import { LoginPage } from "../login/login";
import { BuyFeedPage } from "../buy-feed/buy-feed";
import { User } from "../../models/User";
import { MessageModel } from "../../models/MessageModel";
import { Observable } from "rxjs/Observable";
import { Conversation } from "../../models/Conversation";
import { BookListing } from "../../models/BookListing";

@IonicPage()
@Component({
  selector: "page-user-profile",
  templateUrl: "user-profile.html"
})
export class UserProfilePage {
  private user: User = new User();
  private sender: User = new User();
  private listing: BookListing = new BookListing("", "", "", null, null);

  private allMessages: AngularFirestoreCollection<MessageModel>;
  private messages: Observable<MessageModel[]>;

  private allConversations: Set<Conversation> = new Set<Conversation>();

  public bookTitle: string;

  // public recipientId: string
  // public bookId: string

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore
  ) {
    this.setAllMessagesCollection();
    this.setAllMessageObservableOnCollection();
    this.messages.subscribe();
  }

  ionViewWillEnter() {
    if (!this.af.app.auth().currentUser) {
      this.navCtrl.push(LoginPage, {
        fromPage: "UserProfilePage"
      });
    } else {
      this.getCurrentUserFromDatabase();
    }
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

  getBookFromDatabase(bookId: string) {
    this.af
      .collection<BookListing>("bookListings")
      .doc(bookId)
      .ref.get()
      .then(doc => {
        this.listing = doc.data() as BookListing;
      });
  }

  setAllMessagesCollection() {
    this.allMessages = this.af.collection<MessageModel>("messages");
  }

  setAllMessageObservableOnCollection() {
    this.messages = this.allMessages.snapshotChanges().map(actions => {
      return actions.map(action => {
        let data = action.payload.doc.data() as MessageModel;
        let id = action.payload.doc.id;

        let conv: Conversation = new Conversation("", "", "", "");
        conv.sender = data.senderId;
        conv.listing = data.bookId;
        conv.senderName = data.senderName;
        conv.bookTitle = data.bookTitle;
        this.addToConversation(conv);
        return {
          id,
          ...data
        };
      });
    });
  }

  logoutUser() {
    this.af.app.auth().signOut();
    this.navCtrl.parent.select(0);
  }

  addToConversation(conv: Conversation) {
    this.messages.subscribe();
    let found = false;
    this.allConversations.forEach(element => {
      if (element.listing === conv.listing && element.sender === conv.sender) {
        found = true;
      }
    });

    if (!found) {
      this.allConversations.add(conv);
    }
 
  }
}
