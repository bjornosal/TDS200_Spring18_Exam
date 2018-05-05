import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "angularfire2/firestore";
import { LoginPage } from "../login/login";
import { BuyFeedPage } from "../buy-feed/buy-feed";
import { User } from "../../models/User";
import { MessageModel } from "../../models/MessageModel";
import { Observable } from "rxjs/Observable";

@IonicPage()
@Component({
  selector: "page-user-profile",
  templateUrl: "user-profile.html"
})
export class UserProfilePage {
  private user: User = new User();
  private allMessages: AngularFirestoreCollection<MessageModel>;
  private messages: Observable<MessageModel[]>;

  public title: string
  public messageText: string
  // public senderId: string
  // public recipientId: string
  // public bookId: string

  
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore
  ) {
    this.setAllBookListingsCollection();
    this.setBookListingObservableOnCollection();
  }

  ionViewWillEnter() {
    if (!this.af.app.auth().currentUser) {
      this.navCtrl.push(LoginPage, {
        fromPage: "UserProfilePage"
      });
    } else {
      this.getUserFromDatabase();
    }
  }

  getUserFromDatabase() {
    this.af
      .collection<User>("users")
      .doc(this.af.app.auth().currentUser.uid)
      .ref.get()
      .then(doc => {
        this.user = doc.data() as User;
      });
  }


  setAllBookListingsCollection() {
    this.allMessages = this.af.collection<MessageModel>("messages");
  }
  
  setBookListingObservableOnCollection() {
    this.messages = this.allMessages.snapshotChanges().map(actions => {
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

  logoutUser() {
    this.af.app.auth().signOut();
    this.navCtrl.parent.select(0);
  }
}
