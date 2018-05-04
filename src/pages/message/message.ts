import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-message',
  templateUrl: 'message.html',
})
export class MessagePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  closeModal() {
    this.navCtrl.pop();
  }

  //TODO: SendMessage() here

  sendMessage() {
    //CurrentUserUid
    //RecipientUserUid
    //Message TODO: need model
    //ListingBookId

  }




}
