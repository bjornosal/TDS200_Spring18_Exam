import { Component, Input } from "@angular/core";
import { User } from "../../models/User";
import { AngularFirestore } from "angularfire2/firestore";

@Component({
  selector: "user-profile-information",
  templateUrl: "user-profile-information.html"
})
export class UserProfileInformationComponent {
  
  @Input() public user: User;

  constructor(private af: AngularFirestore) {
  }
}
