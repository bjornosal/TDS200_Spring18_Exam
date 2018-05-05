import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserProfilePage } from './user-profile';
import { MessageComponent } from '../../components/message/message';

@NgModule({
  declarations: [
    UserProfilePage,
    MessageComponent
  ],
  imports: [
    IonicPageModule.forChild(UserProfilePage),
  ],
})
export class UserProfilePageModule {}
