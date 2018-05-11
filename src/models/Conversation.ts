export class Conversation {
    constructor(   
      public sender: string,
      public listing: string,
      public senderName: string,
      public bookTitle: string,
      public recipientId:string, 
      public recipientName: string,
      public updated:any
    ) {}
  }
  