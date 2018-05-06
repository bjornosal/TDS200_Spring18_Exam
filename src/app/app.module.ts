import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { TabsPage } from '../pages/tabs/tabs';
import { SellBookPage } from '../pages/sell-book/sell-book';
import { BuyFeedPage } from '../pages/buy-feed/buy-feed';
import { UserProfilePage } from '../pages/user-profile/user-profile';

import { TabsPageModule } from '../pages/tabs/tabs.module';
import { SellBookPageModule } from '../pages/sell-book/sell-book.module';
import { BuyFeedPageModule } from '../pages/buy-feed/buy-feed.module';
import { UserProfilePageModule } from '../pages/user-profile/user-profile.module';
import { RegisterPageModule } from '../pages/register/register.module';
import { LoginPageModule } from '../pages/login/login.module';

import { AngularFireModule } from "angularfire2";
import { AngularFirestoreModule } from "angularfire2/firestore";
import { AngularFireAuthModule } from "angularfire2/auth";
import { AngularFireStorage } from "angularfire2/storage";
import firebase from './env'
import { Camera } from "@ionic-native/camera";
import { ListingPage } from '../pages/listing/listing';
import { ListingPageModule } from '../pages/listing/listing.module';
import { MessagePageModule } from '../pages/message/message.module';
import { MessagePage } from '../pages/message/message';
import { EditListingPage } from '../pages/edit-listing/edit-listing';
import { EditListingPageModule } from '../pages/edit-listing/edit-listing.module';

@NgModule({
  declarations: [
    MyApp,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    SellBookPageModule,
    BuyFeedPageModule,
    UserProfilePageModule,
    RegisterPageModule,
    LoginPageModule,
    ListingPageModule,
    MessagePageModule,
    EditListingPageModule,
    AngularFireModule.initializeApp(firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    SellBookPage,
    BuyFeedPage,
    UserProfilePage,
    ListingPage,
    MessagePage,
    EditListingPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Camera
  ]
})
export class AppModule {}
