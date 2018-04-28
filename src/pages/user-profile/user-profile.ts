import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { AngularFirestore } from "angularfire2/firestore";
import { LoginPage } from "../login/login";

@IonicPage()
@Component({
  selector: "page-user-profile",
  templateUrl: "user-profile.html"
})
export class UserProfilePage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore
  ) {}

  ionViewWillEnter() {
    this.af.app.auth().onAuthStateChanged(user => {
      if (user) {
        this.navCtrl.setRoot(UserProfilePage);
      } else {
        this.navCtrl.setRoot(LoginPage, {
          fromPage: "UserProfilePage"
        });
      }
    });
  }

  logoutUser() {
    this.af.app.auth().signOut();
  }
}
