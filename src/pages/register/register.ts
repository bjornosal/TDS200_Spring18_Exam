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

  /**
   * Registers a user to firebase
   * with the email and a password.
   * Will upload the photo taken by the user
   * @returns void
   */
  private registerUserWithEmailAndPassword(): void {
    if (this.isUsernameFilled() && this.areEmailsEqual()) {
      this.af.app
        .auth()
        .createUserWithEmailAndPassword(this.user.email, this.password)
        .then(res => {
          this.uploadPhoto();
        })
        .catch(err => {
          this.presentToast(err.message);
        });
    } else {
      this.presentToast(this.getFieldValidationResult());
    }
  }

  /**
   * Uploads a photo to firebase.
   * and adds extra information to firebase.
   * @returns void
   */
  private uploadPhoto(): void {
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
        this.addExtraUserInformationToFirebase(this.user.name, uploadImageUrl);
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
  }

  /**
   * Gets the validation result
   * @returns string full concated string
   */
  private getFieldValidationResult(): string {
    let result: string = "";

    if (!this.isUsernameFilled())
      result = result.concat("Username field can not be empty.");
    if (!this.areEmailsEqual())
      result = result.concat("Emails are not the same. ");
    return result;
  }

  /**
   * Checks if the username is filled.
   * @returns boolean if filled
   */
  private isUsernameFilled(): boolean {
    return this.user.name.length > 0;
  }

  /**
   * Checks if the password is filled
   * @returns boolean if filled
   */
  private isPasswordFilled(): boolean {
    return this.password.length >= 6;
  }

  /**
   * Checks if emails are equal
   * @returns boolean if equal
   */
  private areEmailsEqual(): boolean {
    return this.user.email.toLowerCase === this.confirmedEmail.toLowerCase;
  }

  /**
   * Adds the extra user information to firebase. 
   * Adds it to the firebase database.
   * @param  {string} name to add 
   * @param  {string} photoURL to add
   * @returns void
   */
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
  
  /**
   * Presents a toast to the user.
   * @param  {string} message to present
   * @returns void
   */
  private presentToast(message: string): void {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: "top"
    });

    toast.present();
  }
  
  /**
   * Closes the modal
   */
  private closeModal() {
    this.navCtrl.remove(1);
    this.navCtrl.pop();
  }
  
  /**
   * Takes a photo 
   * @returns void
   */
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
  
  
  /** 
   * Displays an error alert to the user
   * @param  {string} err to set as title
   * @returns void
   */
  private displayErrorAlert(err:string): void {
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: "Error while trying to capture picture",
      buttons: ["OK"]
    });
    alert.present();
  }
  
  /**
   * Pops the current page.
   * @returns void
   */
  private goBackToLogin(): void {
    this.navCtrl.pop();
  }
}
