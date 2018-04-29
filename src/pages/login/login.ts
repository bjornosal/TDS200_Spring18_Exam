import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { RegisterPage } from "../register/register";
import { AngularFirestore } from "angularfire2/firestore";
import { User } from "../../models/User";
import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from "firebase/app";
@IonicPage()
@Component({
  selector: "page-login",
  templateUrl: "login.html"
})
export class LoginPage {
  user: User = new User();

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {
    
  }

  goToRegisterPage() {
    this.navCtrl.push(RegisterPage, {
      fromPage: this.navParams.get("fromPage")
    });
  }

  loginUserWithEmailAndPassword() {
    this.af.app
      .auth()
      .signInWithEmailAndPassword(this.user.email, this.user.password)
      .then(res => {
        this.navCtrl.setRoot(this.navParams.get("fromPage"));
      })
      .catch(err => {
        //TODO add exceptionhandling maybe modal?
        
        console.log(err);
      });
  }

  // loginUserWithGoogle() {
  //   const provider = new firebase.auth.GoogleAuthProvider();
  //   this.afAuth.auth.signInWithPopup(provider)
  //   .then((credential) => {
  //     this.user.email = credential.user.email,
  //     this.user.firstname = credential.user.firstname,
  //     this.user.surname = credential.user.surname
  //   })

  // }
}
