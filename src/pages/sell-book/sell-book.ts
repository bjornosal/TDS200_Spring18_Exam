import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";

import { AngularFirestore } from "angularfire2/firestore";
import { LoginPage } from "../login/login";

@IonicPage()
@Component({
  selector: "page-sell-book",
  templateUrl: "sell-book.html"
})
export class SellBookPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore
  ) {}

  ionViewWillEnter(): void {
    this.af.app.auth().onAuthStateChanged(user => {
      if (user) {
        this.navCtrl.setRoot(SellBookPage);
      } else {
        this.navCtrl.setRoot(LoginPage, {
          fromPage: "SellBookPage"
        });
      }
    });
  }
  
  logoutUser() {
    this.af.app.auth().signOut();
  }

}
