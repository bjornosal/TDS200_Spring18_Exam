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

@IonicPage()
@Component({
  selector: "page-listing",
  templateUrl: "listing.html"
})
export class ListingPage {
  private bookListing: BookListing = new BookListing("", "", "", null, null);
  private openedAsModal: boolean = false;

  private allMessages: AngularFirestoreCollection<MessageModel>;
  private messages: Observable<MessageModel[]>;

  private allConversations: Set<Conversation> = new Set<Conversation>();

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private modalCtrl: ModalController
  ) {

    this.setAllMessagesCollection();
    this.setAllMessageObservableOnCollection();
    this.messages.subscribe();
    this.bookListing = this.navParams.get("listing");
  }

  ionViewWillEnter() {
    if (this.navParams.get("modal") == true) {
      this.openedAsModal = this.navParams.get("modal");
    }
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

  /**
   * Convos
   */

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
    this.messages.subscribe();
    let found = false;
    this.allConversations.forEach(element => {
      if (element.listing === conv.listing && element.sender === conv.sender) {
        found = true;
      }
    });
    console.log("Book id: " +this.bookListing.bookId);
    console.log("Conv id: " + conv.listing);
    if (
      !found &&
      conv.sender != this.af.app.auth().currentUser.uid &&
      this.bookListing.bookId === conv.listing
    ) {
      this.allConversations.add(conv);
    }
  }

  goToConversation(conversation: Conversation) {
    this.navCtrl.push(ChatPage, {
      conversation: conversation
    });
  }
}
