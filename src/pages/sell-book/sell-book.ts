import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";

import { AngularFirestore } from "angularfire2/firestore";
import { LoginPage } from "../login/login";
import { BuyFeedPage } from "../buy-feed/buy-feed";

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


  ionViewWillEnter() {
    if (this.af.app.auth().currentUser != null) {
      this.navCtrl.setRoot(SellBookPage);
    } else {
      this.navCtrl.setRoot(LoginPage, {
        fromPage: "SellBookPage"
      });
    }
}
  async logoutUser(): Promise<any> {
    this.af.app.auth().signOut();
    this.navCtrl.setRoot(BuyFeedPage);
  }

}
