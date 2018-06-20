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
import * as firebase from 'firebase';
@IonicPage()
@Component({
  selector: "page-edit-listing",
  templateUrl: "edit-listing.html"
})
export class EditListingPage {
  bookListing: BookListing = new BookListing("", "", "", null,null, false,"", null, "",[]);

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
  
  /**
   * Posts a book listing
   * @returns void
   */
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
          this.editBookListingInDatabase(this.bookListing.photos[0]);
        } else {
          this.editBookListingInDatabase(this.previewImage);
        }
      });
    } else {
      this.presentToast(this.doFieldValidation());
    }
  }
  /**
   * Edits the book listing in firebase with the new information.
   * @param  {string} imageUrl will be new if user has taken a new photo
   */
  private editBookListingInDatabase(imageUrl: string) {
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
        address: this.bookListing.address,
        isbn: this.bookListing.isbn,
        created: firebase.firestore.FieldValue.serverTimestamp()
      } as BookListing)
      .then(res => {
        this.closeModal();
      });
  }
  /**
   * Checks all fields to check if user has forgotten anything.
   * @returns string to print as modal.
   */
  private doFieldValidation(): string {
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
  /**
   * Takes a photo
   * @returns void
   */
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

  /**
   * Displays an alert with given error message.
   * @param  {string} err to set as title
   * @returns void
   */
  private displayErrorAlert(err:string):void {
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: "Error while trying to capture picture",
      buttons: ["OK"]
    });
    alert.present();
  }
  /**
   * Presents a toast to the user
   * @param  {string} message to present
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
   * Closes the modal
   */
  private closeModal():void {
    this.navCtrl.pop();
  }
  /**
   * Gets the user's location through the PlaceProvider
   * @returns void
   */
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
  /**
   * Makes a http request through the book provider to get the title of a book.
   * @returns void
   */
  private searchForBookUsingIsbn():void {
    this.bookProvider
      .getNameBasedOnIsbn(this.bookListing.isbn)
      .then((books: any) => {
        if (books.totalItems == 0) {
          this.presentToast("No books with that ISBN");
        }
        if (books.totalItems == 1) {
          this.bookListing.title = books.items[0].volumeInfo.title;
        }
      });
  }
}
