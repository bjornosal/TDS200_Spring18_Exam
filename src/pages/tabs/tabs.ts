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
  private amountOfUnreadMessages: number = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore
  ) {

   
  }

  ionViewWillEnter() {
    this.af.app.auth().onAuthStateChanged(
      (user) => {
        if (user) {
          console.log("##### LOGGED IN #####");

          console.log(this.af.app.auth().currentUser.uid);
          this.allUnreadMessages();
        } else {
          console.log("##### NOT LOGGED IN #####");
        }
      });
    
  }

  checkForUserLogin() {
    this.af.app.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        console.log("##### LOGGED IN #####");
        this.allUnreadMessages();
      } else {
        // No user is signed in.
        console.log("##### NOT LOGGED IN #####");
        if(this.unreadMessages != null)
        this.unreadMessages.unsubscribe();
      }
    });
  }



  allUnreadMessages() {
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
