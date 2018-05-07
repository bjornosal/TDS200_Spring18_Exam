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
  private listing: BookListing = new BookListing("", "", "", null, null);

  private allMessages: AngularFirestoreCollection<MessageModel>;
  private messages: Observable<MessageModel[]>;

  private allListings: AngularFirestoreCollection<BookListing>;
  private listings: Observable<BookListing[]>;

  private allConversations: Set<Conversation> = new Set<Conversation>();

  private displayMessages: boolean = true;

  private hasUnreadMessages: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private modalCtrl: ModalController
  ) {
    this.getCurrentUserFromDatabase();
  }

  ionViewWillEnter() {
    if (!this.af.app.auth().currentUser) {
      this.navCtrl.push(LoginPage, {
        fromPage: "UserProfilePage"
      });
    } else {
    }
  }

  getCurrentUserFromDatabase() {
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
        this.messages.subscribe();
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
    this.allMessages = this.af.collection<MessageModel>("messages", ref => {
      return ref.orderBy('created')
    });
  }

  setAllMessageObservableOnCollection() {
    this.messages = this.allMessages.snapshotChanges().map(actions => {
      return actions.map(action => {
        let data = action.payload.doc.data() as MessageModel;
        let id = action.payload.doc.id;
        let name = data.senderName;


        if (
          data.read == false &&
          data.recipientId === this.af.app.auth().currentUser.uid
        ) {
          this.hasUnreadMessages = true;
        }

        if (data.senderId === this.af.app.auth().currentUser.uid) {
          name = data.recipientName;
        }
        //TODO: update chats created at
        let conv: Conversation = new Conversation(
          data.senderId,
          data.bookId,
          name,
          data.bookTitle,
          data.recipientId,
          data.recipientName
        );

        this.addToConversation(conv);
        return {
          id,
          ...data
        };
      });
    });
  }

  getAllListingsByUser() {
    this.allListings = this.af.collection<BookListing>("bookListings", ref => {
      return ref.where("seller", "==", this.af.app.auth().currentUser.uid);
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

  logoutUser() {
    this.af.app.auth().signOut();
    this.navCtrl.parent.select(0);
  }

  addToConversation(conv: Conversation) {
    let found = false;
    this.allConversations.forEach(element => {
      //TODO: take into method
      if (
        element.listing === conv.listing &&
        (element.sender === conv.sender ||
          element.recipientName === conv.sender)
      ) {
        found = true;
      }
    });

    if (!found) {
      this.allConversations.add(conv);
    }
  }

  displayMessagesContainer(): boolean {
    return this.displayMessages;
  }

  openListingsContainer() {
    this.displayMessages = false;
  }

  openMessagesContainer() {
    this.displayMessages = true;
  }

  presentListingModal(listing: BookListing) {
    let listingModal = null;

    listingModal = this.modalCtrl
      .create(ListingPage, {
        listing: listing,
        modal: true
      })
      .present();
  }

  goToConversation(conversation: Conversation) {
    this.navCtrl.push(ChatPage, {
      conversation: conversation
    });
  }
}
