import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { MessageModel } from "../../models/MessageModel";
import { AngularFirestore } from "angularfire2/firestore";

@Injectable()
export class UnreadMessagesProvider {
  public amountOfUnreadConversations: number = 5;
  public unreadMessages: Observable<MessageModel[]>;

  constructor(private af: AngularFirestore) {
    
  }

  getAmountOfUnreadConversations(): number {
    return this.amountOfUnreadConversations;
  }

  setAmountOfUnreadConversations(unreadConversations: number) {
    this.amountOfUnreadConversations = unreadConversations;
  }

  allUnreadMessages() {
    this.unreadMessages = this.af
      .collection<MessageModel>("messages", ref => {
        return ref.where("read", "==", "false");
      })
      .snapshotChanges()
      .map(actions => {
        return actions.map(action => {
          let data = action.payload.doc.data() as MessageModel;
          let id = action.payload.doc.id;

          if (data.recipientId === this.af.app.auth().currentUser.uid) {
            return {
              id,
              ...data
            };
          }
        });
      });
  }
}
