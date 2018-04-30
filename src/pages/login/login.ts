import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController
} from "ionic-angular";
import { RegisterPage } from "../register/register";
import { AngularFirestore } from "angularfire2/firestore";
import { User } from "../../models/User";
import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from "firebase/app";
import { TabsPage } from "../tabs/tabs";
@IonicPage({
  priority: "high"
})
@Component({
  selector: "page-login",
  templateUrl: "login.html"
})
export class LoginPage {
  private user: User = new User();
  private fromPage: string;
  private password: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private afAuth: AngularFireAuth,
    private viewCtrl: ViewController
  ) {
    this.fromPage = this.navParams.get("fromPage");
  }

  goToRegisterPage() {
    this.navCtrl.push(RegisterPage, {
      fromPage: this.fromPage
    });
  }

  loginUserWithEmailAndPassword() {
    this.af.app
      .auth()
      .signInWithEmailAndPassword(this.user.email, this.password)
      .then(res => {
        this.navCtrl.push(this.fromPage);
      })
      .catch(err => {
        //TODO add exceptionhandling maybe modal?

        console.log(err);
      });
  }
}
