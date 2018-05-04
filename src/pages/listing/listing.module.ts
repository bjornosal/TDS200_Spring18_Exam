import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListingPage } from './listing';
import { MessagePage } from '../message/message';

@NgModule({
  declarations: [
    ListingPage
  ],
  imports: [
    IonicPageModule.forChild(ListingPage),
  ],
})
export class ListingPageModule {}
