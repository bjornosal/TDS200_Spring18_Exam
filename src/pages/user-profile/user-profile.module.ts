import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserProfilePage } from './user-profile';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    UserProfilePage
  ],
  imports: [
    IonicPageModule.forChild(UserProfilePage),
    PipesModule
  ],
})
export class UserProfilePageModule {}
