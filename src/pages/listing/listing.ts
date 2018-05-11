import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ModalController,
  ToastController
} from "ionic-angular";
import { BookListing } from "../../models/BookListing";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "angularfire2/firestore";
import { MessageModel } from "../../models/MessageModel";
import { LoginPage } from "../login/login";
import { EditListingPage } from "../edit-listing/edit-listing";
import { Observable } from "rxjs/Observable";
import { Conversation } from "../../models/Conversation";
import { ChatPage } from "../chat/chat";
import { User } from "../../models/User";
import { SellerProfilePage } from "../seller-profile/seller-profile";
import * as firebase from "firebase";

@IonicPage()
@Component({
  selector: "page-listing",
  templateUrl: "listing.html"
})
export class ListingPage {
  private seller: User = new User("", "", null);
  private user: User = new User("", "", null);
  private bookListing: BookListing = new BookListing(
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
  private openedAsModal: boolean = false;

  private allMessages: AngularFirestoreCollection<MessageModel>;
  private messages: Observable<MessageModel[]>;

  private allConversations: Conversation[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}
  
  /**
   * On entering page, gets the listing from param
   * gets the current user as well.
   */
  private ionViewWillEnter() {
    if (this.navParams.get("modal") == true) {
      this.openedAsModal = this.navParams.get("modal");
    }
    this.bookListing = this.navParams.get("listing");
    this.getSellerFromDatabase();
    if (this.af.app.auth().currentUser != null) {
      this.getCurrentUserFromDatabase();
    }
  }
  
  /**
   * Gets the seller of the listing from the database. 
   * @returns void
   */
  private getSellerFromDatabase(): void {
    this.af
      .collection<User>("users")
      .doc(this.bookListing.seller)
      .ref.get()
      .then(doc => {
        this.seller = doc.data() as User;
      });
  }
  
  /**
   * Gets the current user from database.
   * If the user is logged in, it will set the angularfirecollection
   * and the observable, before it subscribes to the messages collection.
   */
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
        this.messages.subscribe();
      });
  }
 
  /**
   * Presents an edit modal
   */
  private presentEditModal() {
    this.modalCtrl
      .create(EditListingPage, {
        listing: this.navParams.get("listing")
      })
      .present();
  }

  /**
   * Checks if the current user is logged in
   * @returns boolean if the current user is logged in.
   */
  private isCurrentUserLoggedIn(): boolean {
    return this.af.app.auth().currentUser != null;
  }
  
  /**
   * Checks if the listing is by the current user
   * @returns boolean if opened by current user.
   */
  private isListingByCurrentUser(): boolean {
    if (this.af.app.auth().currentUser != null) {
      return this.bookListing.seller == this.af.app.auth().currentUser.uid;
    } else {
      return false;
    }
  }
  
  /**
   * Checks if the listing was opened as modal
   * @returns boolean if opened as modal
   */
  private isOpenedAsModal(): boolean {
    return this.openedAsModal;
  }

  /**
   * Closes modal.
   * @returns void
   */
  private closeModal(): void {
    this.navCtrl.pop();
  }
  
  /**
   * Sets an angularfirecollection on the messages collection where the book id 
   * is the current id and orders it by the created column.
   * @returns void
   */
  private setAllMessagesCollection(): void {
    this.allMessages = this.af.collection<MessageModel>("messages", ref => {
      return ref
        .where("bookId", "==", this.bookListing.bookId)
        .orderBy("created");
    });
  }
  
  /**
   * Sets an observable on the angularfirecollection messages
   * @returns void
   */
  private setAllMessageObservableOnCollection(): void {
    this.messages = this.allMessages.snapshotChanges().map(actions => {
      return actions.map(action => {
        let data = action.payload.doc.data() as MessageModel;
        let id = action.payload.doc.id;
        let name = data.senderName;

        data.read == false &&
          data.recipientId === this.af.app.auth().currentUser.uid;

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
   * Adds a conversation to the conversation array if it is not found
   * in the conversation array.
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
   * Navigates the user to a conversation. 
   * If the user is not logged in, user will be 
   * navigated to the login page.
   * @param  {Conversation} incomingConversation? to navigate to
   * @returns void
   */
  private goToConversation(incomingConversation?: Conversation): void {
    let conversation: Conversation = incomingConversation;

    if (this.af.app.auth().currentUser == null) {
      this.navCtrl.push(LoginPage, {
        fromPage: "contact"
      });
    } else {
      if (this.allConversations.length === 0) {
        conversation = new Conversation(
          this.af.app.auth().currentUser.uid,
          this.bookListing.bookId,
          this.user.name,
          this.bookListing.title,
          this.bookListing.seller,
          this.seller.name,
          firebase.firestore.FieldValue.serverTimestamp()
        );
      }
      this.navCtrl.push(ChatPage, {
        conversation: conversation
      });
    }
  }
  
  /**
   * Updates a book listing on firebase to be sold or unsold.
   * @param  {boolean} sold 
   * @returns void
   */
  private markBookAsSold(sold: boolean): void {
    this.af
      .collection<BookListing>("bookListings")
      .doc(this.bookListing.bookId)
      .update({
        sold: sold
      } as BookListing)
      .then(res => {
        if (sold) {
          this.presentToast("Book was marked as sold.");
          this.navCtrl.pop();
        } else {
          this.presentToast("Book was re-listed.");
          this.navCtrl.pop();
        }
      });
  }
  
  /**
   * Navigates to the sellers profile
   * @returns void
   */
  private goToSellerProfile(): void {
    this.navCtrl.push(SellerProfilePage, {
      seller: this.bookListing.seller
    });
  }
  
  /**
   * Presents a toast for the user.
   * @param  {string} message the message to give.
   * @returns void
   */
  private presentToast(message: string): void {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: "top"
    });

    toast.present();
  }
}
