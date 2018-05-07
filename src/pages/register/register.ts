import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ToastController
} from "ionic-angular";
import { User } from "../../models/User";
import { AngularFirestore } from "angularfire2/firestore";

@IonicPage()
@Component({
  selector: "page-register",
  templateUrl: "register.html"
})
export class RegisterPage {
  private user: User = new User("","","");
  private confirmedEmail: string;
  private password: string = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private toastCtrl: ToastController
  ) {}

  registerUserWithEmailAndPassword() {
    if (this.isUsernameFilled() && this.areEmailsEqual()) {
      this.af.app
        .auth()
        .createUserWithEmailAndPassword(this.user.email, this.password)
        .then(res => {
          //TODO: add photo here

          this.addExtraUserInformationToFirebase(this.user.name, " ");
          if (this.navParams.get("fromPage") === "contact") {
            this.closeModal();
          } else {
            this.navCtrl.push(this.navParams.get("fromPage")).then(() => {
              const index = this.navCtrl.getActive().index;
              this.navCtrl.remove(0, index);
            });
          }
        })
        .catch(err => {
          this.presentToast(err.message);
        });
    } else {
      this.presentToast(this.getFieldValidationResult());
    }
  }

  getFieldValidationResult(): string {
    let result: string = "";

    if (!this.isUsernameFilled())
      result = result.concat("Username field can not be empty.<br>");
    if (!this.areEmailsEqual())
      result = result.concat("Emails are not the same. <br>");
    return result;
  }

  isUsernameFilled(): boolean {
    return this.user.name.length > 0;
  }

  isPasswordFilled(): boolean {
    return this.password.length >= 6;
  }

  areEmailsEqual(): boolean {
    return this.user.email.toLowerCase === this.confirmedEmail.toLowerCase;
  }

  addExtraUserInformationToFirebase(name: string, photoURL: string) {
    this.af
      .collection<User>("users")
      .doc(this.af.app.auth().currentUser.uid)
      .set({
        name: name,
        email: this.user.email,
        photoURL: photoURL
      } as User);
  }

  presentToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: "top"
    });

    toast.present();
  }

  closeModal() {
    this.navCtrl.remove(1);
    this.navCtrl.pop();
  }
}
