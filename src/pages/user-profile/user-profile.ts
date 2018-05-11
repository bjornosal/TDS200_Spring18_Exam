import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ModalController
} from "ionic-angular";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "angularfire2/firestore";
import { LoginPage } from "../login/login";
import { User } from "../../models/User";
import { MessageModel } from "../../models/MessageModel";
import { Observable } from "rxjs/Observable";
import { Conversation } from "../../models/Conversation";
import { BookListing } from "../../models/BookListing";
import { ListingPage } from "../listing/listing";
import { ChatPage } from "../chat/chat";

@IonicPage()
@Component({
  selector: "page-user-profile",
  templateUrl: "user-profile.html"
})
export class UserProfilePage {
  private user: User = new User("", "", "");
  private listing: BookListing = new BookListing(
    "",
    "",
    "",
    null,
    null,
    false,
    "",
    null,
    "",
    []
  );

  private allMessages: AngularFirestoreCollection<MessageModel>;
  private messages: Observable<MessageModel[]>;

  private allListings: AngularFirestoreCollection<BookListing>;
  private listings: Observable<BookListing[]>;

  private allConversations: Conversation[] = [];

  private displayMessages: boolean = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private modalCtrl: ModalController
  ) {}

  private ionViewWillEnter() {
    if (!this.af.app.auth().currentUser) {
      this.navCtrl.push(LoginPage, {
        fromPage: "UserProfilePage"
      });
    } else {
      this.getCurrentUserFromDatabase();
    }
  }

  private getCurrentUserFromDatabase() {
    this.af
      .collection<User>("users")
      .doc(this.af.app.auth().currentUser.uid)
      .ref.get()
      .then(doc => {
        this.user = doc.data() as User;
      })
      .then(res => {
        this.setAllMessagesCollection();
        this.setAllMessageObservableOnCollection();
        this.getAllListingsByUser();
        this.getObservableOnAllListings();
        this.messages.subscribe();
      });
  }

  private getBookFromDatabase(bookId: string) {
    this.af
      .collection<BookListing>("bookListings")
      .doc(bookId)
      .ref.get()
      .then(doc => {
        this.listing = doc.data() as BookListing;
      });
  }

  private setAllMessagesCollection() {
    this.allMessages = this.af.collection<MessageModel>("messages", ref => {
      return ref.orderBy("created");
    });
  }

  private setAllMessageObservableOnCollection() {
    this.allConversations = [];
    this.messages = this.allMessages.snapshotChanges().map(actions => {
      return actions.map(action => {
        let data = action.payload.doc.data() as MessageModel;
        let id = action.payload.doc.id;
        let name = data.senderName;

        if (data.senderId === this.af.app.auth().currentUser.uid) {
          name = data.recipientName;
        }
        let conv: Conversation = new Conversation(
          data.senderId,
          data.bookId,
          name,
          data.bookTitle,
          data.recipientId,
          data.recipientName,
          data.created
        );
        if (
          conv.sender === this.af.app.auth().currentUser.uid ||
          conv.recipientId === this.af.app.auth().currentUser.uid
        )
          this.addToConversation(conv);
        return {
          id,
          ...data
        };
      });
    });
    this.allConversations.sort(function(a: any, b: any) {
      return b.updated - a.updated;
    });
  }

  private getAllListingsByUser() {
    this.allListings = this.af.collection<BookListing>("bookListings", ref => {
      return ref.where("seller", "==", this.af.app.auth().currentUser.uid);
    });
  }

  private getObservableOnAllListings() {
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

  private logoutUser() {
    this.af.app.auth().signOut();
    this.navCtrl.parent.select(0);
  }

  private addToConversation(conv: Conversation) {
    let found = false;

    this.allConversations.forEach(element => {
      if (
        element.listing === conv.listing &&
        (element.sender === conv.sender || element.recipientId === conv.sender)
      ) {
        element.updated = conv.updated;
        found = true;
      }
    });

    if (!found) {
      this.allConversations.push(conv);
    }
  }

  private displayMessagesContainer(): boolean {
    return this.displayMessages;
  }

  private openListingsContainer() {
    this.displayMessages = false;
    this.getObservableOnAllListings();
  }

  private openMessagesContainer() {
    this.displayMessages = true;
  }

  private presentListingModal(listing: BookListing) {
    this.modalCtrl
      .create(ListingPage, {
        listing: listing,
        modal: true
      })
      .present();
  }

  private goToConversation(conversation: Conversation) {
    this.navCtrl.push(ChatPage, {
      conversation: conversation
    });
  }
}
