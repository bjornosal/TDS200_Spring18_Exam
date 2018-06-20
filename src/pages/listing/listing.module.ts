import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListingPage } from './listing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    ListingPage
  ],
  imports: [
    IonicPageModule.forChild(ListingPage),
    ComponentsModule
  ],
})
export class ListingPageModule {}
