import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { MessageModel } from "../../models/MessageModel";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "angularfire2/firestore";
import { Observable } from "rxjs/Observable";
import { Conversation } from "../../models/Conversation";


@IonicPage()
@Component({
  selector: "page-chat",
  templateUrl: "chat.html"
})
export class ChatPage {
  private allMessages: AngularFirestoreCollection<MessageModel>;
  private messages: Observable<MessageModel[]>;

  private bookId: string;
  private senderId: string;
  private conversation:Conversation;
  public messageText: string;
  public messageTitle: string;
  
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore
  ) {
    this.setAllMessagesCollection();
    this.setAllMessageObservableOnCollection();
    this.messages.subscribe();
    this.conversation = navParams.get("conversation");
    this.bookId = this.conversation.listing;
    this.senderId = this.conversation.sender;
  }

  setAllMessagesCollection() {
    this.allMessages = this.af.collection<MessageModel>("messages");
  }

  setAllMessageObservableOnCollection() {
    this.messages = this.allMessages.snapshotChanges().map(actions => {
      return actions.map(action => {
        let data = action.payload.doc.data() as MessageModel;
        let id = action.payload.doc.id;

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
}
