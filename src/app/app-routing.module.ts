import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RecipeViewerComponent } from './recipe-viewer/recipe-viewer.component';
import { RecipeEditorComponent } from './recipe-editor/recipe-editor.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { SessionService } from './services/session.service';
import { authGuard } from './auth/auth.guard';
import { dirtyRecipeGuard } from './dirty-recipe/dirty-recipe.guard';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [authGuard, dirtyRecipeGuard] },
  { path: 'recipe/:id', component: RecipeViewerComponent, canActivate: [authGuard, dirtyRecipeGuard] },
  { path: 'recipe/:id/edit', component: RecipeEditorComponent, canActivate: [authGuard] },
  { path: 'login', component: SignInComponent },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(routes)],
  providers: [SessionService],
})
export class AppRoutingModule {}
