export class MessageModel {
    constructor(
      public title: string,
      public messageText: string,
      public senderId: string,
      public senderName:string,
      public recipientId: string,
      public bookId: string,
      public bookTitle:string      
    ) {}
  }
  