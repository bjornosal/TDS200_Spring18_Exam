import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { Camera, CameraOptions } from "@ionic-native/camera";

import { AngularFirestore } from "angularfire2/firestore";
import { LoginPage } from "../login/login";
import { BuyFeedPage } from "../buy-feed/buy-feed";

@IonicPage()
@Component({
  selector: "page-sell-book",
  templateUrl: "sell-book.html"
})
export class SellBookPage {
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
    private camera: Camera
  ) {}

  ionViewWillEnter() {
    if (this.af.app.auth().currentUser == null) {
      this.navCtrl.setRoot(LoginPage, {
        fromPage: "SellBookPage"
      });
    }
  }

  logoutUser() {
    this.af.app.auth().signOut();
    this.navCtrl.setRoot(BuyFeedPage);
  }

  takePhoto() {
    this.camera.getPicture(this.options).then(
      imageData => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        let base64Image = "data:image/jpeg;base64," + imageData;
      },
      err => {
        // Handle error
        //How
      }
    );
  }
}
