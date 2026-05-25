import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  selector: "app-root",
  styleUrls: ['./app.component.css'],
  templateUrl: "./app.component.html",
  imports: [
    RouterOutlet
  ],
  standalone: true,
})
export class AppComponent {

}
