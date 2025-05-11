import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomUnitsDialog, IngredientsComponent } from './ingredients/ingredients.component';
import { StepsComponent } from './steps/steps.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecipeEditorComponent } from './recipe-editor/recipe-editor.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RecipeViewerComponent } from './recipe-viewer/recipe-viewer.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatLineModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DeleteRecipeDialog } from './delete-recipe/delete-recipe-dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DirtyRecipeDialog } from './dirty-recipe/dirty-recipe-dialog';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiGatewayRequestSigner } from './auth/request-signer';

@NgModule({
  declarations: [
    AppComponent,
    CustomUnitsDialog,
    DeleteRecipeDialog,
    DirtyRecipeDialog,
    HomeComponent,
    IngredientsComponent,
    RecipeEditorComponent,
    RecipeViewerComponent,
    SignInComponent,
    StepsComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    DragDropModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatLineModule,
    MatListModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  providers: [provideHttpClient(withInterceptors([apiGatewayRequestSigner]))],
  bootstrap: [AppComponent],
})
export class AppModule {}
