import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { maps_apiKey } from "./../../app/env";

@Injectable()
export class PlacesProvider {
  constructor(public http: HttpClient) {}

  /**
   * Code from course
   * @param lat latitude
   * @param lng longitude
   */
  getAddressBasedOnLatLng(lat: number, lng: number) {
    return new Promise((resolve, reject) => {
      this.http
        .get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&sensor=true&key=${maps_apiKey}`
        )
        .subscribe(
          response => {
            resolve(response);
          },
          error => {
            reject(error);
          }
        );
    });
  }
}
