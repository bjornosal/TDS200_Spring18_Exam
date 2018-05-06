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

@IonicPage()
@Component({
  selector: "page-user-profile",
  templateUrl: "user-profile.html"
})
export class UserProfilePage {
  private user: User = new User();
  private listing: BookListing = new BookListing("", "", "", null, null);

  private allMessages: AngularFirestoreCollection<MessageModel>;
  private messages: Observable<MessageModel[]>;

  private allListings: AngularFirestoreCollection<BookListing>;
  private listings: Observable<BookListing[]>;

  private allConversations: Set<Conversation> = new Set<Conversation>();

  private displayMessages: boolean = true;

  // public recipientId: string
  // public bookId: string

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private modalCtrl: ModalController
  ) {
    this.setAllMessagesCollection();
    this.setAllMessageObservableOnCollection();
    this.messages.subscribe();
    this.getAllListingsByUser();
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

        let conv: Conversation = new Conversation(
          data.senderId,
          data.bookId,
          data.senderName,
          data.bookTitle
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
    this.messages.subscribe();
    let found = false;
    this.allConversations.forEach(element => {
      if (element.listing === conv.listing && element.sender === conv.sender) {
        found = true;
      }
    });

    if (!found && conv.sender !== this.af.app.auth().currentUser.uid) {
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
    console.log(listing);
    
    listingModal = this.modalCtrl
      .create(ListingPage, {
        listing: listing,
        modal: true
      })
      .present();
  }
}
