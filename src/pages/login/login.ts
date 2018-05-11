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
import { ToastController } from "ionic-angular";
import { TabsPage } from "../tabs/tabs";
import { BuyFeedPage } from "../buy-feed/buy-feed";

@IonicPage({
  priority: "high"
})
@Component({
  selector: "page-login",
  templateUrl: "login.html"
})
export class LoginPage {
  private user: User = new User("","","");
  private fromPage: string;
  private password: string = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private afAuth: AngularFireAuth,
    private viewCtrl: ViewController,
    private toastCtrl: ToastController
  ) {
    this.fromPage = this.navParams.get("fromPage");
   
  }
 
  /**
   * Navigates the user to the register page
   * @returns void
   */
  private goToRegisterPage():void {
    this.navCtrl.push(RegisterPage, {
      fromPage: this.fromPage
    });
  }
 
  /**
   * Logs the user in with email and password. 
   * Afterwards navigates the user to the page 
   * got sent from.
   * @returns void
   */
  private loginUserWithEmailAndPassword():void {
    if (this.doFieldValidation() === "") {
      this.af.app
        .auth()
        .signInWithEmailAndPassword(this.user.email, this.password)
        .then(res => {
          if (this.fromPage === "contact") {
            this.closeModal();
          } else {
            this.navCtrl.push(this.fromPage);
          }
        })
        .catch(err => {
          this.presentToast(err.message);
        });
    } else {
      this.presentToast(this.doFieldValidation());
    }
  }
  
  /**
   * Does field validation and 
   * concats the strings where the fields 
   * fail validation.
   * @returns string
   */
  private doFieldValidation(): string {
    let result: string = "";

    if (this.user.email === "" || this.user.email === undefined)
      result = result.concat("E-mail field can not be empty.");
    if (this.password === "")
      result = result.concat("Password field can not be empty.");

    return result;
  }

  /**
   * Presents a toast to the user.
   * @param  {string} message to prsent to user.
   * @returns void
   */
  private presentToast(message: string):void {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: "top"
    });

    toast.present();
  }

  /**
   * Closes the modal.
   */
  private closeModal() {
    this.navCtrl.pop();
  }

  
}
