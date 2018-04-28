import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { User } from "../../models/User";
import { AngularFirestore } from "angularfire2/firestore";

@IonicPage()
@Component({
  selector: "page-register",
  templateUrl: "register.html"
})
export class RegisterPage {
  user: User = new User();

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore
  ) {}

  registerUserWithEmailAndPassword() {
    this.af.app
      .auth()
      .createUserWithEmailAndPassword(this.user.email, this.user.password)
      .then(res => {
        this.navCtrl.setRoot(this.navParams.get('fromPage'));
      })
      .catch(err => {
        console.log(err);
      });
  }
}
