import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BuyFeedPage } from './buy-feed';
import { BookListingComponent } from '../../components/book-listing/book-listing';
import { ComponentsModule } from '../../components/components.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    BuyFeedPage
  ],
  imports: [
    IonicPageModule.forChild(BuyFeedPage),
    ComponentsModule,
    PipesModule
  ],
})
export class BuyFeedPageModule {}
