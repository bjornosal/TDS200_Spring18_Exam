import { NgModule } from '@angular/core';
import { BookListingComponent } from './book-listing/book-listing';
import { MessageComponent } from './message/message';
@NgModule({
	declarations: [BookListingComponent,
    MessageComponent],
	imports: [],
	exports: [BookListingComponent,
    MessageComponent]
})
export class ComponentsModule {}
