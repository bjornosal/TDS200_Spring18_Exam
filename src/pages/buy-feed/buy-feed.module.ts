import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BuyFeedPage } from './buy-feed';
import { BookListingComponent } from '../../components/book-listing/book-listing';

@NgModule({
  declarations: [
    BuyFeedPage,
    BookListingComponent
  ],
  imports: [
    IonicPageModule.forChild(BuyFeedPage),
  ],
})
export class BuyFeedPageModule {}
