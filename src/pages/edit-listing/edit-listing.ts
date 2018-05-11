import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
  ToastController
} from "ionic-angular";
import { BookListing } from "../../models/BookListing";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { Condition } from "../../models/enums/enums";
import { AngularFirestore } from "angularfire2/firestore";
import { AngularFireStorage } from "angularfire2/storage";
import { Geolocation } from "@ionic-native/geolocation";
import { PlacesProvider } from "../../providers/places/places";
import { BookProvider } from "../../providers/book/book";

@IonicPage()
@Component({
  selector: "page-edit-listing",
  templateUrl: "edit-listing.html"
})
export class EditListingPage {
  bookListing: BookListing = new BookListing("", "", "", null,null, null, null, "",[]);

  private conditionNew: Condition = Condition.New;
  private conditionUsed: Condition = Condition.Used;
  private conditionWellUsed: Condition = Condition["Well-Used"];
  private previewImage: string = "";

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
    private toastCtrl: ToastController,
    private afStorage: AngularFireStorage,
    private geolocation: Geolocation,
    private placesProvider: PlacesProvider,
    private bookProvider: BookProvider
  ) {
    this.bookListing = navParams.get("listing");
  }

  postBookListing() {
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
          this.editBookListingInDatabase(this.bookListing.photos[0]);
        } else {
          this.editBookListingInDatabase(this.previewImage);
        }
      });
    } else {
      this.presentToast(this.doFieldValidation());
    }
  }

  editBookListingInDatabase(imageUrl: string) {
    this.af
      .collection<BookListing>("bookListings")
      .doc(this.bookListing.bookId)
      .set({
        title: this.bookListing.title,
        description: this.bookListing.description,
        price: this.bookListing.price,
        seller: this.af.app.auth().currentUser.uid,
        sold: false,
        photos: [imageUrl],
        condition: this.bookListing.condition,
        address: this.bookListing.address
       } as BookListing)
      .then(res => {
        this.closeModal();
      });
  }

  doFieldValidation(): string {
    let result: string = "";
    //TODO: Consider adding an alertCtrl
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
    if (this.bookListing.condition === undefined)
      result = result.concat("Condition needs to be set. ");
    return result;
  }

  takePhoto() {
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

  displayErrorAlert(err) {
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

  closeModal() {
    this.navCtrl.pop();
  }

  getLocation() {
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

  searchForBookUsingIsbn() {
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
