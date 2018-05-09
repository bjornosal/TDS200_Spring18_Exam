import { NgModule } from "@angular/core";
import { BookListingComponent } from "./book-listing/book-listing";
import { MessageComponent } from "./message/message";
import { IonicModule } from "ionic-angular";
import { UserProfileInformationComponent } from './user-profile-information/user-profile-information';
@NgModule({
  declarations: [BookListingComponent, MessageComponent,
    UserProfileInformationComponent],
  imports: [IonicModule],
  exports: [BookListingComponent, MessageComponent,
    UserProfileInformationComponent]
})
export class ComponentsModule {}
