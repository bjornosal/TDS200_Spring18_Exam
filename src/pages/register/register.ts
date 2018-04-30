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
  private user: User = new User();
  private confirmedEmail: string;
  private password: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore
  ) {}

  registerUserWithEmailAndPassword() {
    if (this.isUsernameFilled() && this.areEmailsEqual()) {
      console.log("Got in");
      this.af.app
        .auth()
        .createUserWithEmailAndPassword(this.user.email, this.password)
        .then(res => {
          //TODO add photo here

          this.addExtraUserInformationToFirebase(this.user.name, " ");

          this.navCtrl.push(this.navParams.get("fromPage")).then(() => {
            const index = this.navCtrl.getActive().index;
            this.navCtrl.remove(0, index);
          });
        })
        .catch(err => {
          console.log(err.message);
        });
    }
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
}
