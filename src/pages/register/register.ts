import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ToastController,
  AlertController
} from "ionic-angular";
import { User } from "../../models/User";
import { AngularFirestore } from "angularfire2/firestore";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { AngularFireStorage } from "angularfire2/storage";

@IonicPage()
@Component({
  selector: "page-register",
  templateUrl: "register.html"
})
export class RegisterPage {
  private user: User = new User("", "", "");
  private confirmedEmail: string;
  private password: string = "";

  private previewImage: string = "";

  private options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true,
    allowEdit: true,
    cameraDirection: 1
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private afStorage: AngularFireStorage,
    private toastCtrl: ToastController,
    private camera: Camera,
    private alertCtrl: AlertController
  ) {}

  private registerUserWithEmailAndPassword(): void {
    if (this.isUsernameFilled() && this.areEmailsEqual()) {
      this.af.app
        .auth()
        .createUserWithEmailAndPassword(this.user.email, this.password)
        .then(res => {
          let imageFileName = `${
            this.af.app.auth().currentUser.email
          }_${new Date().getTime()}.png`;

          let task = this.afStorage
            .ref(imageFileName)
            .putString(this.previewImage, "base64", {
              contentType: "image/png"
            });
          let uploadEvent = task.downloadURL();

          uploadEvent.subscribe(uploadImageUrl => {
            if (this.previewImage === "") {
              this.addExtraUserInformationToFirebase(
                this.user.name,
                "assets/imgs/fallback-profile-photo.jpg"
              );
            } else {
              this.addExtraUserInformationToFirebase(
                this.user.name,
                uploadImageUrl
              );
            }

            this.navCtrl.parent.select(0);
          });

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

  private getFieldValidationResult(): string {
    let result: string = "";

    if (!this.isUsernameFilled())
      result = result.concat("Username field can not be empty.");
    if (!this.areEmailsEqual())
      result = result.concat("Emails are not the same. ");
    return result;
  }

  private isUsernameFilled(): boolean {
    return this.user.name.length > 0;
  }

  private isPasswordFilled(): boolean {
    return this.password.length >= 6;
  }

  private areEmailsEqual(): boolean {
    return this.user.email.toLowerCase === this.confirmedEmail.toLowerCase;
  }

  private addExtraUserInformationToFirebase(
    name: string,
    photoURL: string
  ): void {
    this.af
      .collection<User>("users")
      .doc(this.af.app.auth().currentUser.uid)
      .set({
        name: name,
        email: this.user.email,
        photoURL: photoURL
      } as User);
  }

  private presentToast(message: string): void {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: "top"
    });

    toast.present();
  }

  //TODO: test this closing

  private closeModal() {
    this.navCtrl.remove(1);
    this.navCtrl.pop();
  }

  private takePhoto(): void {
    this.camera.getPicture(this.options).then(
      imageData => {
        this.previewImage = imageData;
      },
      err => {
        this.displayErrorAlert(err);
      }
    );
  }

  private displayErrorAlert(err): void {
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: "Error while trying to capture picture",
      buttons: ["OK"]
    });
    alert.present();
  }

  private goBackToLogin(): void {
    this.navCtrl.pop();
  }
}
