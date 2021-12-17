import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'recipe';

  recipePicker() {
    console.log("recipe picker");
  }

  recipeEditor() {
    console.log("recipe editor");
  }
}
