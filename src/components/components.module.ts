import { NgModule } from "@angular/core";
import { BookListingComponent } from "./book-listing/book-listing";
import { MessageComponent } from "./message/message";
import { IonicModule } from "ionic-angular";
@NgModule({
  declarations: [BookListingComponent, MessageComponent],
  imports: [IonicModule],
  exports: [BookListingComponent, MessageComponent]
})
export class ComponentsModule {}
