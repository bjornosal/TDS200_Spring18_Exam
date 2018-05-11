import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ModalController,
  ToastController,
  Content
} from "ionic-angular";
import { MessageModel } from "../../models/MessageModel";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "angularfire2/firestore";
import { Observable } from "rxjs/Observable";
import { Conversation } from "../../models/Conversation";
import { BookListing } from "../../models/BookListing";
import { User } from "../../models/User";
import * as firebase from "firebase";
import { Subscription } from "rxjs/Subscription";

@IonicPage()
@Component({
  selector: "page-chat",
  templateUrl: "chat.html"
})
export class ChatPage {
  @ViewChild(Content) content: Content;

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

  private bookId: string = "";
  private senderId: string;
  private conversation: Conversation;
  public messageText: string;
  private recipientId: string = "";
  private messagesSubscription: Subscription;

  private user: User = new User("", "", "");
  private recipient: User = new User("", "", "");

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  /**
   * Life Cycle method when entering page
   * Will open up an AngularFireCollection and initialize observable on it.
   * Will get necessary information and subscribe to the messages observable.
   * This so that it can be unsubscribed later.
   * @returns void
   */
  private ionViewWillEnter(): void {
    this.setAllMessagesCollection();
    this.setAllMessageObservableOnCollection();
    this.getCurrentUserFromDatabase();

    this.conversation = this.navParams.get("conversation");
    this.bookId = this.conversation.listing;
    this.senderId = this.conversation.sender;
    this.getBookFromDatabase(this.conversation.listing);
    this.messagesSubscription = this.messages.subscribe();
  }
  /**
   * Lifecycle method when page has been entered
   * Scrolls to the bottom, where the newest message is.
   * @returns void
   */
  private ionViewDidEnter(): void {
    this.content.scrollToBottom();
  }
  /**
   * Lifecycle method when user has left.
   * Unsubscribes to the messages to they won't be read if user leaves.
   * @returns void
   */
  private ionViewDidLeave(): void {
    this.messagesSubscription.unsubscribe();
  }
  /**
   * Sets an AngularFireCollection.
   * @returns void
   */
  private setAllMessagesCollection(): void {
    this.allMessages = this.af.collection<MessageModel>("messages", ref => {
      return ref.orderBy("created");
    });
  }

  private setAllMessageObservableOnCollection(): void {
    this.messages = this.allMessages.snapshotChanges().map(actions => {
      return actions.map(action => {
        let data = action.payload.doc.data() as MessageModel;
        let id = action.payload.doc.id;

        if (data.senderId !== this.af.app.auth().currentUser.uid) {
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
  /**
   * Sets message to read
   * @param  {string} messageId message to set to read
   * @returns void
   */
  private setMessageToRead(messageId: string): void {
    this.af
      .collection<MessageModel>("messages")
      .doc(messageId)
      .update({
        read: true
      } as MessageModel);
  }
  /**
   * Gets a  given book from the database
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
        this.listing.bookId = bookId;
      })
      .then(res => {
        if (this.af.app.auth().currentUser.uid === this.listing.seller) {
          if (
            this.af.app.auth().currentUser.uid === this.conversation.recipientId
          ) {
            this.getRecipientFromDatabase(this.conversation.sender);
            this.recipientId = this.conversation.sender;
          } else {
            this.getRecipientFromDatabase(this.conversation.recipientId);
            this.recipientId = this.conversation.recipientId;
          }
        } else {
          this.getRecipientFromDatabase(this.listing.seller);
          this.recipientId = this.listing.seller;
        }
      });
  }
  /**
   * Sends a message (Adds it to firebase database)
   * Presents a toast if the user has not written any message.
   * @returns void
   */
  private sendMessage(): void {
    if (this.messageText !== "") {
      this.af.collection<MessageModel>("messages").add({
        messageText: this.messageText,
        senderId: this.af.app.auth().currentUser.uid,
        senderName: this.user.name,
        recipientId: this.recipientId,
        recipientName: this.recipient.name,
        bookId: this.listing.bookId,
        bookTitle: this.listing.title,
        read: false,
        created: firebase.firestore.FieldValue.serverTimestamp()
      } as MessageModel);

      this.messageText = "";
    } else {
      let toast = this.toastCtrl.create({
        message: "Message can not be empty",
        duration: 3000,
        position: "top"
      });

      toast.present();
    }
  }

  
  /**
   * Sets the user object to the current user from the database
   * @returns void
   */
  private getCurrentUserFromDatabase(): void {
    this.af
      .collection<User>("users")
      .doc(this.af.app.auth().currentUser.uid)
      .ref.get()
      .then(doc => {
        this.user = doc.data() as User;
      });
  }
  /** 
   * Sets the recipient object to the user with the given id.
   * @param  {string} userId to get
   * @returns void
   */
  private getRecipientFromDatabase(userId: string): void {
    this.af
      .collection<User>("users")
      .doc(userId)
      .ref.get()
      .then(doc => {
        this.recipient = doc.data() as User;
      });
  }
  /**
   * Closes modal
   * @returns void
   */
  private closeModal(): void {
    this.navCtrl.pop();
  }
  /**
   * Checks if the message is sent by the current user. 
   * @param  {MessageModel} message to check
   * @returns boolean if the sender id is the current user's.
   */
  private isMessageSentByCurrentUser(message: MessageModel): boolean {
    return this.af.app.auth().currentUser.uid === message.senderId;
  }
}
