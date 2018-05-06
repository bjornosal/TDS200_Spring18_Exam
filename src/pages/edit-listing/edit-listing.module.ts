import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditListingPage } from './edit-listing';

@NgModule({
  declarations: [
    EditListingPage,
  ],
  imports: [
    IonicPageModule.forChild(EditListingPage),
  ],
})
export class EditListingPageModule {}
