import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RecipeViewerComponent } from './recipe-viewer/recipe-viewer.component';
import { RecipeEditorComponent } from './recipe-editor/recipe-editor.component';
import { AuthGuard } from './auth/auth.guard';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { SessionService } from './services/session.service';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'recipe/:id', component: RecipeViewerComponent, canActivate: [AuthGuard] },
  { path: 'recipe/:id/edit', component: RecipeEditorComponent, canActivate: [AuthGuard] },
  { path: 'login', component: SignInComponent },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(routes)],
  providers: [AuthGuard, SessionService],
})
export class AppRoutingModule {}
