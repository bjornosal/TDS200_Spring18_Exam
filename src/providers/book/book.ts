import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { apiKey } from "./../../app/env";

@Injectable()
export class BookProvider {
  constructor(public http: HttpClient) {}

  getNameBasedOnIsbn(isbn: string) {
    return new Promise((resolve, reject) => {
      this.http
        .get(
          `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${apiKey}`
        )
        .subscribe(
          response => {
            console.log(response);
            
            resolve(response);
          },
          error => {
            reject(error);
          }
        );
    });
  }
}
