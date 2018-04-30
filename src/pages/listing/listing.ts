import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BookListing } from '../../models/BookListing';
import { AngularFirestore } from 'angularfire2/firestore';

@IonicPage()
@Component({
  selector: 'page-listing',
  templateUrl: 'listing.html',
})
export class ListingPage {
  private bookListing: BookListing = new BookListing("","","");

  constructor(public navCtrl: NavController, public navParams: NavParams, private af: AngularFirestore) {
  }

  ionViewWillEnter() {
    this.bookListing = this.navParams.get("listing");
  }
}
