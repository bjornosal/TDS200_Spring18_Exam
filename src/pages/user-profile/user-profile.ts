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

  ionViewWillEnter(): void {
    if (this.af.app.auth().currentUser != null) {
      this.navCtrl.setRoot(UserProfilePage);
    } else {
      this.navCtrl.setRoot(LoginPage);
    }
  }
}
