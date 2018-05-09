export class MessageModel {
    constructor(
      public messageText: string,
      public senderId: string,
      public senderName:string,
      public recipientId: string,
      public recipientName: string,
      public bookId: string,
      public bookTitle:string,
      public read:boolean,
      public created: any
    ) {}
  }
  