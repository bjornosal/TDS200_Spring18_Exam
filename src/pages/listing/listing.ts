import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ModalController
} from "ionic-angular";
import { BookListing } from "../../models/BookListing";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "angularfire2/firestore";
import { MessagePage } from "../message/message";
import { MessageModel } from "../../models/MessageModel";
import { LoginPage } from "../login/login";
import { EditListingPage } from "../edit-listing/edit-listing";
import { Observable } from "rxjs/Observable";
import { Conversation } from "../../models/Conversation";
import { ChatPage } from "../chat/chat";
import { User } from "../../models/User";
import { SellerProfilePage } from "../seller-profile/seller-profile";

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
    []
  );
  private openedAsModal: boolean = false;

  private allMessages: AngularFirestoreCollection<MessageModel>;
  private messages: Observable<MessageModel[]>;

  private allConversations: Set<Conversation> = new Set<Conversation>();

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private modalCtrl: ModalController
  ) {}

  ionViewWillEnter() {
    if (this.navParams.get("modal") == true) {
      this.openedAsModal = this.navParams.get("modal");
    }
    this.bookListing = this.navParams.get("listing");
    this.getSellerFromDatabase();
    if (this.af.app.auth().currentUser != null) {
      this.getCurrentUserFromDatabase();
    }
  }

  getSellerFromDatabase() {
    this.af
      .collection<User>("users")
      .doc(this.bookListing.seller)
      .ref.get()
      .then(doc => {
        this.seller = doc.data() as User;
      });
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
        this.messages.subscribe();
      });
  }

  presentMessageModal() {
    let messageModal = null;

    if (this.isCurrentUserLoggedIn()) {
      messageModal = this.modalCtrl.create(MessagePage, {
        listing: this.navParams.get("listing")
      });
    } else {
      messageModal = this.modalCtrl.create(LoginPage, {
        fromPage: "contact"
      });
    }
    messageModal.present();
  }

  presentEditModal() {
    this.modalCtrl
      .create(EditListingPage, {
        listing: this.navParams.get("listing")
      })
      .present();
  }

  private isCurrentUserLoggedIn(): boolean {
    return this.af.app.auth().currentUser != null;
  }

  isListingByCurrentUser(): boolean {
    if (this.af.app.auth().currentUser != null) {
      return this.bookListing.seller == this.af.app.auth().currentUser.uid;
    } else {
      return false;
    }
  }

  isOpenedByModal(): boolean {
    return this.openedAsModal;
  }

  closeModal() {
    this.navCtrl.pop();
  }

  setAllMessagesCollection() {
    this.allMessages = this.af.collection<MessageModel>("messages", ref => {
      return ref
        .where("bookId", "==", this.bookListing.bookId)
        .orderBy("created");
    });
  }

  setAllMessageObservableOnCollection() {
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

  addToConversation(conv: Conversation) {
    let found = false;
    this.allConversations.forEach(element => {
      //TODO: take into method
      if (
        element.listing === conv.listing &&
        (element.sender === conv.sender ||
          element.recipientId === conv.sender)
      ) {
        found = true;
      }
    });

    if (!found) {
      this.allConversations.add(conv);
    }
  }

  goToConversation(incomingConversation?: Conversation) {
    let conversation: Conversation = incomingConversation;

    if (this.af.app.auth().currentUser == null) {
      this.navCtrl.push(LoginPage, {
        fromPage: "contact"
      });
    } else {
      if (this.allConversations.size === 0) {
        conversation = new Conversation(
          this.af.app.auth().currentUser.uid,
          this.bookListing.bookId,
          this.user.name,
          this.bookListing.title,
          this.bookListing.seller,
          this.seller.name
        );
      }
      this.navCtrl.push(ChatPage, {
        conversation: conversation
      });
    }
  }

  markBookAsSold() {
    this.af
      .collection<BookListing>("bookListings")
      .doc(this.bookListing.bookId)
      .update({
        sold: true
      } as BookListing);
  }

  goToSellerProfile() {
    this.navCtrl.push(SellerProfilePage, {
      seller: this.bookListing.seller
    });
  }
}
