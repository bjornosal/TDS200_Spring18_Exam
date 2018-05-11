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
import { Condition } from "../../models/enums/enums";
import { AngularFireStorage } from "angularfire2/storage";
import { Geolocation } from "@ionic-native/geolocation";
import { PlacesProvider } from "../../providers/places/places";
import { BookProvider } from "../../providers/book/book";
import * as firebase from "firebase";

@IonicPage()
@Component({
  selector: "page-sell-book",
  templateUrl: "sell-book.html"
})
export class SellBookPage {
  private bookListing: BookListing = new BookListing("", "", "", null,null, false,"", null, "",[]);

  private condition: Condition;
  private conditionNew: Condition = Condition.New;
  private conditionUsed: Condition = Condition.Used;
  private conditionWellUsed: Condition = Condition["Well-Used"];
  private previewImage: string = "";

  private options: CameraOptions = {
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
    private afStorage: AngularFireStorage,
    private camera: Camera,
    private alertCtrl: AlertController,
    private viewCtrl: ViewController,
    private toastCtrl: ToastController,
    private geolocation: Geolocation,
    private placesProvider: PlacesProvider,
    private bookProvider: BookProvider
  ) {}

  private ionViewWillEnter() {
    if (!this.af.app.auth().currentUser) {
      this.navCtrl.push(LoginPage, {
        fromPage: "SellBookPage"
      });
    }
  }

  private postBookListing():void {
    if (this.doFieldValidation() === "") {
      let imageFileName = `${
        this.af.app.auth().currentUser.email
      }_${new Date().getTime()}.png`;

      let task = this.afStorage
        .ref(imageFileName)
        .putString(this.previewImage, "base64", { contentType: "image/png" });
      let uploadEvent = task.downloadURL();

      uploadEvent.subscribe(uploadImageUrl => {
        if (this.previewImage === "") {
          this.addBookListingToDatabase("assets/imgs/fallback-photo.jpg");
        } else {
          this.addBookListingToDatabase(uploadImageUrl);
        }

        this.navCtrl.parent.select(0);
      });
    } else {
      this.presentToast(this.doFieldValidation());
    }
  }

  private clearSellBookPage():void {
    this.bookListing = new BookListing("", "", "", null,null, false,"", null, "",[]);
    this.previewImage = "";
  }

  private addBookListingToDatabase(imageUrl: string):void {
    this.af
      .collection<BookListing>("bookListings")
      .add({
        title: this.bookListing.title,
        description: this.bookListing.description,
        price: this.bookListing.price,
        seller: this.af.app.auth().currentUser.uid,
        photos: [imageUrl],
        sold: false,
        isbn: this.bookListing.isbn,
        condition: this.condition,
        address: this.bookListing.address,
        created: firebase.firestore.FieldValue.serverTimestamp()
      } as BookListing)
      .then(res => {
        this.clearSellBookPage();
      });
  }

  private doFieldValidation(): string {
    let result: string = "";
    if (this.bookListing.title === "")
      result = result.concat("Title field can not be empty. ");
    if (this.bookListing.description === "")
      result = result.concat("Description field can not be empty. ");
    if (this.bookListing.price === undefined || this.bookListing.price === null)
      result = result.concat("Price field can not be empty. ");
    if (this.bookListing.price > 2000)
      result = result.concat(
        "Price can not be above 2000. It's used books, not pure gold."
      );
    if (this.condition === undefined)
      result = result.concat("Condition needs to be set. ");
    return result;
  }

  private logoutUser() {
    this.af.app.auth().signOut();
    this.clearSellBookPage();
    this.navCtrl.parent.select(0);
  }


  private takePhoto():void {
    this.camera.getPicture(this.options).then(
      imageData => {
        this.bookListing.photos.push("data:image/jpeg;base64," + imageData);
        this.previewImage = imageData;
      },
      err => {
        this.displayErrorAlert(err);
      }
    );
  }

  private displayErrorAlert(err):void {
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: "Error while trying to capture picture",
      buttons: ["OK"]
    });
    alert.present();
  }

  private presentToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: "top"
    });
    toast.present();
  }

  private getLocation():void {
    this.geolocation
      .getCurrentPosition()
      .then((res: any) => {
        this.placesProvider
          .getAddressBasedOnLatLng(res.coords.latitude, res.coords.longitude)
          .then((place: any) => {
            this.bookListing.address = place.results[3].formatted_address;
          });
      })
      .catch(err => {
        console.log("error: " + err);
      });
  }

  private searchForBookUsingIsbn():void {
    this.bookProvider
      .getNameBasedOnIsbn(this.bookListing.isbn)
      .then((books: any) => {
        if (books.totalItems == 0) {
          this.presentToast("No books with that ISBN");
        }
        if (books.totalItems == 1) {
          console.log(books.items[0].volumeInfo.title);
          this.bookListing.title = books.items[0].volumeInfo.title;
        }
      });
  }
}
