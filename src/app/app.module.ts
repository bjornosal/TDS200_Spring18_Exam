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
    UserProfilePageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    SellBookPage,
    BuyFeedPage,
    UserProfilePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
