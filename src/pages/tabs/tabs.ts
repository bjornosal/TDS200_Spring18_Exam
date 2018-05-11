import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { BuyFeedPage } from "../buy-feed/buy-feed";
import { SellBookPage } from "../sell-book/sell-book";
import { UserProfilePage } from "../user-profile/user-profile";
import { Observable } from "rxjs/Observable";
import { MessageModel } from "../../models/MessageModel";
import { AngularFirestore } from "angularfire2/firestore";

@IonicPage()
@Component({
  selector: "page-tabs",
  templateUrl: "tabs.html"
})
export class TabsPage {
  BookFeedPage = BuyFeedPage;
  SellBookPage = SellBookPage;
  UserProfilePage = UserProfilePage;

  private unreadMessages: Observable<MessageModel[]>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore
  ) {}
 
  /**
   * Checks if a user is logged in, and sets an observable if user is.
   */
  private ionViewWillEnter() {
    this.af.app.auth().onAuthStateChanged(user => {
      if (user) {
        this.allUnreadMessages();
      } else {
      }
    });
  }
  
  /**
   * Will get all unread messages in an observable. 
   * Used to check how many unread messages the user has.
   * @returns void
   */
  private allUnreadMessages(): void {
    this.unreadMessages = this.af
      .collection<MessageModel>("messages", ref => {
        return ref
          .where("read", "==", false)
          .where("recipientId", "==", this.af.app.auth().currentUser.uid);
      })
      .snapshotChanges()
      .map(actions => {
        return actions.map(action => {
          let data = action.payload.doc.data() as MessageModel;
          let id = action.payload.doc.id;
          return {
            id,
            ...data
          };
        });
      });
  }
}
