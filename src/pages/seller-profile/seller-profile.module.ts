import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SellerProfilePage } from './seller-profile';
import { ComponentsModule } from '../../components/components.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    SellerProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(SellerProfilePage),
    PipesModule, ComponentsModule
  ],
})
export class SellerProfilePageModule {}
