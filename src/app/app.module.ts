import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {IngredientsComponent} from './ingredients/ingredients.component';
import {StepsComponent} from './steps/steps.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSelectModule} from '@angular/material/select';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RecipeEditorComponent} from './recipe-editor/recipe-editor.component';
import {RecipePickerComponent} from './recipe-picker/recipe-picker.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {RecipeViewerComponent} from './recipe-viewer/recipe-viewer.component';
import {MatTabsModule} from '@angular/material/tabs';
import {AppRoutingModule} from './app-routing.module';
import {RouterModule} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {SignInComponent} from './auth/sign-in/sign-in.component';

@NgModule({
  declarations: [
    AppComponent,
    IngredientsComponent,
    StepsComponent,
    RecipeEditorComponent,
    RecipePickerComponent,
    RecipeViewerComponent,
    HomeComponent,
    SignInComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatTabsModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
