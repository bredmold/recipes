import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RecipeViewerComponent } from './recipe-viewer/recipe-viewer.component';
import { RecipeEditorComponent } from './recipe-editor/recipe-editor.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'recipe/:id', component: RecipeViewerComponent },
  { path: 'recipe/:id/edit', component: RecipeEditorComponent },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(routes)],
})
export class AppRoutingModule {}
