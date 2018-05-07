import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatPage } from './chat';
import { ComponentsModule } from '../../components/components.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    ChatPage
    ],
  imports: [
    IonicPageModule.forChild(ChatPage),
    ComponentsModule,
    PipesModule
  ],
})
export class ChatPageModule {}
