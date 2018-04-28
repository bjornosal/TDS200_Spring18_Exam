import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SellBookPage } from './sell-book';

@NgModule({
  declarations: [
    SellBookPage,
  ],
  imports: [
    IonicPageModule.forChild(SellBookPage),
  ],
})
export class SellBookPageModule {}
