import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";

import { MyApp } from "./app.component";
import { TabsPage } from "../pages/tabs/tabs";
import { SellBookPage } from "../pages/sell-book/sell-book";
import { BuyFeedPage } from "../pages/buy-feed/buy-feed";
import { UserProfilePage } from "../pages/user-profile/user-profile";

import { TabsPageModule } from "../pages/tabs/tabs.module";
import { SellBookPageModule } from "../pages/sell-book/sell-book.module";
import { BuyFeedPageModule } from "../pages/buy-feed/buy-feed.module";
import { UserProfilePageModule } from "../pages/user-profile/user-profile.module";
import { RegisterPageModule } from "../pages/register/register.module";
import { LoginPageModule } from "../pages/login/login.module";

import { AngularFireModule } from "angularfire2";
import { AngularFirestoreModule } from "angularfire2/firestore";
import { AngularFireAuthModule } from "angularfire2/auth";
import { AngularFireStorageModule } from "angularfire2/storage";
import { firebase_auth } from "./env";
import { ListingPage } from "../pages/listing/listing";
import { ListingPageModule } from "../pages/listing/listing.module";
import { EditListingPage } from "../pages/edit-listing/edit-listing";
import { EditListingPageModule } from "../pages/edit-listing/edit-listing.module";
import { ChatPage } from "../pages/chat/chat";
import { ChatPageModule } from "../pages/chat/chat.module";
import { MessageComponent } from "../components/message/message";
import { ComponentsModule } from "../components/components.module";
import { BookListingComponent } from "../components/book-listing/book-listing";
import { PipesModule } from "../pipes/pipes.module";
import { SellerProfilePageModule } from "../pages/seller-profile/seller-profile.module";
import { SellerProfilePage } from "../pages/seller-profile/seller-profile";
import { Camera } from "@ionic-native/camera";
import { Geolocation } from "@ionic-native/geolocation";
import { PlacesProvider } from "../providers/places/places";
import { HttpClientModule } from '@angular/common/http';
import { BookProvider } from '../providers/book/book';

@NgModule({
  declarations: [MyApp, TabsPage],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    SellBookPageModule,
    BuyFeedPageModule,
    UserProfilePageModule,
    RegisterPageModule,
    LoginPageModule,
    ListingPageModule,
    EditListingPageModule,
    ChatPageModule,
    SellerProfilePageModule,
    AngularFireModule.initializeApp(firebase_auth),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    ComponentsModule,
    PipesModule,
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    SellBookPage,
    BuyFeedPage,
    UserProfilePage,
    ListingPage,
    EditListingPage,
    ChatPage,
    SellerProfilePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    Camera,
    Geolocation,
    PlacesProvider,
    BookProvider
  ]
})
export class AppModule {}
