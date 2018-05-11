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

  /**
   * Navigates the user to the login page if not logged in. 
   * @returns void
   */
  private ionViewWillEnter():void {
    if (!this.af.app.auth().currentUser) {
      this.navCtrl.push(LoginPage, {
        fromPage: "UserProfilePage"
      });
    } else {
      this.getCurrentUserFromDatabase();
    }
  }
 
  /**
   * Gets current user from the database.
   * @returns void
   */
  private getCurrentUserFromDatabase(): void {
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

  /**
   * Gets a specific book from a database
   * @param  {string} bookId to get
   * @returns void
   */
  private getBookFromDatabase(bookId: string): void {
    this.af
      .collection<BookListing>("bookListings")
      .doc(bookId)
      .ref.get()
      .then(doc => {
        this.listing = doc.data() as BookListing;
      });
  }
  
  /**
   * Sets a collection on all messages and orders them by date created.
   * @returns void
   */
  private setAllMessagesCollection(): void {
    this.allMessages = this.af.collection<MessageModel>("messages", ref => {
      return ref.orderBy("created");
    });
  }
  
  /**
   * Sets an observable on the message collection
   * @returns void
   */
  private setAllMessageObservableOnCollection(): void {
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
  
  /**
   * Gets all listings by the user.
   * @returns void
   */
  private getAllListingsByUser(): void {
    this.allListings = this.af.collection<BookListing>("bookListings", ref => {
      return ref.where("seller", "==", this.af.app.auth().currentUser.uid);
    });
  }
  
  /**
   * Gets an observable on all listiings.
   * @returns void
   */
  private getObservableOnAllListings(): void {
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
  
  /**
   * Logs out the user.
   * @returns void
   */
  private logoutUser(): void {
    this.af.app.auth().signOut();
    this.navCtrl.parent.select(0);
  }
 
  /**
   * Adds a conversation to the collection of conversations.
   * @param  {Conversation} conv to add 
   * @returns void
   */
  private addToConversation(conv: Conversation): void {
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
  
  /**
   * Displays the messages pane to the user.
   * @returns boolean
   */
  private displayMessagesContainer(): boolean {
    return this.displayMessages;
  }
  
  /**
   * Opens the listing pane, and updates the observable on all listings.
   * @returns void
   */
  private openListingsContainer(): void {
    this.displayMessages = false;
    this.getObservableOnAllListings();
  }
  
  /**
   * Opens a message container
   * @returns void
   */
  private openMessagesContainer(): void {
    this.displayMessages = true;
  }
  
  /**
   * Presents a listing modal to the user.
   * @param  {BookListing} listing to present
   * @returns void
   */
  private presentListingModal(listing: BookListing): void {
    this.modalCtrl
      .create(ListingPage, {
        listing: listing,
        modal: true
      })
      .present();
  }
  
  /**
   * Navigates the user to a conversation.
   * @param  {Conversation} conversation
   * @returns void
   */
  private goToConversation(conversation: Conversation): void {
    this.navCtrl.push(ChatPage, {
      conversation: conversation
    });
  }
}
