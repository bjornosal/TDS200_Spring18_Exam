import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
  ViewController
} from "ionic-angular";

import { Camera, CameraOptions } from "@ionic-native/camera";

import { AngularFirestore } from "angularfire2/firestore";
import { LoginPage } from "../login/login";
import { BuyFeedPage } from "../buy-feed/buy-feed";

import { BookListing } from "../../models/BookListing";
import { isUndefined } from "ionic-angular/util/util";

@IonicPage()
@Component({
  selector: "page-sell-book",
  templateUrl: "sell-book.html"
})
export class SellBookPage {
  bookListing: any = new BookListing("", "");

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
    private viewCtrl: ViewController
  ) {}

  postBookListing() {
    this.addBookListingToDatabase();
    this.navCtrl.push(BuyFeedPage).then(() => {
      const index = this.navCtrl.getActive().index;
      this.navCtrl.remove(0, index);
    });
  }

  addBookListingToDatabase() {
    this.af.collection<BookListing>("bookListings").add({
      title: this.bookListing.title,
      description: this.bookListing.description,
      price: this.bookListing.price,
      photos: this.getPhotos()
    } as BookListing);
  }

  ionViewWillEnter() {
    if (!this.af.app.auth().currentUser) {
      // this.navCtrl.push(LoginPage, {
      //   fromPage: "SellBookPage"
      // });

      this.navCtrl
        .push(LoginPage, {
          fromPage: "SellBookPage"
        })
        .then(() => {
          const index = this.navCtrl.getActive().index;
          this.navCtrl.remove(0, index);
        });
    }
  }

  ionViewDidEnter() {
    const index = this.navCtrl.getActive().index;
    this.navCtrl.remove(0, index);

    if (!this.navCtrl.canGoBack()) {
      this.viewCtrl.showBackButton(false);
    }
    
  }

  logoutUser() {
    this.af.app.auth().signOut();
    this.navCtrl.goToRoot({});
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
}
