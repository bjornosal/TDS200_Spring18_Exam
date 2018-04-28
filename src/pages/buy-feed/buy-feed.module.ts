import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BuyFeedPage } from './buy-feed';

@NgModule({
  declarations: [
    BuyFeedPage,
  ],
  imports: [
    IonicPageModule.forChild(BuyFeedPage),
  ],
})
export class BuyFeedPageModule {}
