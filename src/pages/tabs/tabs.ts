import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { BuyFeedPage } from "../buy-feed/buy-feed";
import { SellBookPage } from "../sell-book/sell-book";
import { UserProfilePage } from "../user-profile/user-profile";

@IonicPage()
@Component({
  selector: "page-tabs",
  templateUrl: "tabs.html"
})
export class TabsPage {
  BookFeedPage = BuyFeedPage;
  SellBookPage = SellBookPage;
  UserProfilePage = UserProfilePage;

  constructor(public navCtrl: NavController, public navParams: NavParams) {}
}
