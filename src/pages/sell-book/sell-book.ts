import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
  ViewController,
  ToastController
} from "ionic-angular";

import { Camera, CameraOptions } from "@ionic-native/camera";

import { AngularFirestore } from "angularfire2/firestore";
import { LoginPage } from "../login/login";
import { BuyFeedPage } from "../buy-feed/buy-feed";

import { BookListing } from "../../models/BookListing";
import { isUndefined } from "ionic-angular/util/util";
import { Condition } from "../../models/enums/enums";

@IonicPage()
@Component({
  selector: "page-sell-book",
  templateUrl: "sell-book.html"
})
export class SellBookPage {
  bookListing: any = new BookListing("", "", "", null, null);

  private condition: Condition;
  private conditionNew: Condition = Condition.New;
  private conditionUsed: Condition = Condition.Used;
  private conditionWellUsed: Condition = Condition["Well-Used"];

  options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFirestore,
    private camera: Camera,
    private alertCtrl: AlertController,
    private viewCtrl: ViewController,
    private toastCtrl: ToastController
  ) {}

  ionViewWillEnter() {
    if (!this.af.app.auth().currentUser) {
      this.navCtrl.push(LoginPage, {
        fromPage: "SellBookPage"
      });
    }
  }

  postBookListing() {
    if (this.doFieldValidation() === "") {
      this.addBookListingToDatabase();
      this.clearSellBookPage();
      this.navCtrl.parent.select(0);
    } else {
      this.presentToast(this.doFieldValidation());
    }
  }

  clearSellBookPage() {
    this.bookListing = new BookListing("", "", "", null, null);
  }

  addBookListingToDatabase() {
    this.af.collection<BookListing>("bookListings").add({
      title: this.bookListing.title,
      description: this.bookListing.description,
      price: this.bookListing.price,
      seller: this.af.app.auth().currentUser.uid,
      photos: this.getPhotos(),
      condition: this.condition
    } as BookListing);
  }

  doFieldValidation(): string {
    let result: string = "";

    if (this.bookListing.title === "")
      result = result.concat("Title field can not be empty.\n");
    if (this.bookListing.description === "")
      result = result.concat("Description field can not be empty.\n");
    if (this.bookListing.price === undefined || this.bookListing.price === "")
      result = result.concat("Price field can not be empty.\n");
    if (this.condition === undefined)
      result = result.concat("Condition needs to be set.\n");
    return result;
  }

  logoutUser() {
    this.af.app.auth().signOut();
    this.clearSellBookPage();
    this.navCtrl.parent.select(0);
  }

  getPhotos(): string[] {
    return isUndefined(this.bookListing.photos) ||
      this.bookListing.photo == null
      ? ["../../assets/imgs/fallback-photo.jpg"]
      : this.bookListing.photos;
  }

  takePhoto() {
    this.camera.getPicture(this.options).then(
      imageData => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        this.bookListing.photos.push("data:image/jpeg;base64," + imageData);
      },
      err => {
        this.displayErrorAlert(err);
      }
    );
  }

  displayErrorAlert(err) {
    console.log(err);
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: "Error while trying to capture picture",
      buttons: ["OK"]
    });
    alert.present();
  }

  presentToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: "top"
    });

    toast.present();
  }
}
