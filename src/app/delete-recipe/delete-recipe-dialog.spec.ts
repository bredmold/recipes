import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteRecipeDialog } from './delete-recipe-dialog';
import { HarnessLoader } from '@angular/cdk/testing';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { Recipe } from '../types/recipe';
import { Component } from '@angular/core';
import { RecipeService } from '../services/recipe.service';
import { BehaviorSubject } from 'rxjs';
import { MatButtonHarness } from '@angular/material/button/testing';

@Component({
  selector: 'test-component',
  template: '',
  standalone: false,
})
class DeleteRecipeTestComponent {
  constructor(private readonly dialog: MatDialog) {}

  open(config: MatDialogConfig) {
    return this.dialog.open(DeleteRecipeDialog, config);
  }
}

describe('RecipeDeleteDialog', () => {
  let recipeServiceSpy: any;
  let fixture: ComponentFixture<DeleteRecipeTestComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    recipeServiceSpy = {
      viewRecipe: new BehaviorSubject<Recipe | undefined>(undefined),
      editRecipe: new BehaviorSubject<Recipe | undefined>(undefined),
      deleteRecipeById: jasmine.createSpy('deleteRecipeById'),
    };

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: RecipeService,
          useValue: recipeServiceSpy,
        },
      ],
      declarations: [DeleteRecipeTestComponent, DeleteRecipeDialog],
      imports: [BrowserModule, MatDialogModule, MatSnackBarModule, NoopAnimationsModule],
    }).compileComponents();
    fixture = TestBed.createComponent(DeleteRecipeTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it('should load harness for dialog', async () => {
    const recipe = new Recipe('title', 'desc', [], [], []);
    fixture.componentInstance.open({ data: { recipe: recipe, duration: 100 } });
    const dialogs = await loader.getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);
  });

  it('should close the dialog when clicking cancel', async () => {
    let closed = false;
    const recipe = new Recipe('title', 'desc', [], [], []);
    const dialogRef = fixture.componentInstance.open({ data: { recipe: recipe, duration: 100 } });
    dialogRef.afterClosed().subscribe(() => {
      closed = true;
    });

    const dialog = await loader.getHarness(MatDialogHarness);
    const titleText = await dialog.getTitleText();
    expect(titleText).toEqual(recipe.title);

    const cancelButtonHarness = await loader.getHarness(MatButtonHarness.with({ text: 'Cancel' }));
    await cancelButtonHarness.click();
    await fixture.whenStable();

    expect(closed).toBeTrue();
  });

  it('should save the recipe when we click the OK button', async () => {
    let closed = false;
    const recipe = new Recipe('title', 'desc', [], [], []);
    const dialogRef = fixture.componentInstance.open({ data: { recipe: recipe, duration: 100 } });
    dialogRef.afterClosed().subscribe(() => {
      closed = true;
    });

    recipeServiceSpy.deleteRecipeById.and.returnValue(Promise.resolve());

    const dialog = await loader.getHarness(MatDialogHarness);
    const okButtonHarness = await dialog.getHarness(MatButtonHarness.with({ text: 'Ok' }));
    await okButtonHarness.click();
    await fixture.whenStable();

    expect(closed).toBeTrue();

    expect(recipeServiceSpy.deleteRecipeById).toHaveBeenCalledOnceWith(recipe.id);
  });
});
