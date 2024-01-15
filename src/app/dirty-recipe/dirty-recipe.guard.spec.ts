import { ActivatedRouteSnapshot } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeService } from '../services/recipe.service';
import { Recipe } from '../types/recipe';
import { BehaviorSubject } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { dirtyRecipeGuard } from './dirty-recipe.guard';
import { fakeRouterState } from '../utils.spec';
import { DirtyRecipeDialog } from './dirty-recipe-dialog';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { MatButtonHarness } from '@angular/material/button/testing';

@Component({
  selector: 'test-component',
  template: '',
})
class DirtyRecipeTestComponent {}

describe('dirtyRecipeGuard', () => {
  let recipeServiceSpy: jasmine.SpyObj<RecipeService>;
  let editRecipe: BehaviorSubject<Recipe | undefined>;
  const dummyRoute = {} as ActivatedRouteSnapshot;
  let fixture: ComponentFixture<DirtyRecipeTestComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    editRecipe = new BehaviorSubject<Recipe | undefined>(undefined);
    recipeServiceSpy = jasmine.createSpyObj('RecipeService', ['invalidateEditRecipe'], { editRecipe: editRecipe });

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: RecipeService,
          useValue: recipeServiceSpy,
        },
      ],
      declarations: [DirtyRecipeDialog, DirtyRecipeTestComponent],
      imports: [MatDialogModule],
    }).compileComponents();
    fixture = TestBed.createComponent(DirtyRecipeTestComponent);

    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it('should return true if the edit recipe is unmodified', async () => {
    const recipe = new Recipe('test', 'test', [], [], []);
    recipe.checkpoint();
    editRecipe.next(recipe);

    const guardResult = await TestBed.runInInjectionContext(() => dirtyRecipeGuard(dummyRoute, fakeRouterState('/')));
    expect(guardResult).toBeTrue();
  });

  it('should return true if the user closes the dialog', async () => {
    const recipe = new Recipe('test', 'test', [], [], []);
    recipe.checkpoint();
    recipe.title = 'modified';
    editRecipe.next(recipe);

    const guardPromise = TestBed.runInInjectionContext(() =>
      dirtyRecipeGuard(dummyRoute, fakeRouterState('/')),
    ) as Promise<boolean>;

    await fixture.whenStable();
    const dialog = await loader.getHarness(MatDialogHarness);
    const titleText = await dialog.getTitleText();
    expect(titleText).toEqual(recipe.title);

    await dialog.close();

    const guardResult = await guardPromise;
    expect(guardResult).toBeFalse();
  });

  it('should return true if the user clicks OK', async () => {
    const recipe = new Recipe('test', 'test', [], [], []);
    recipe.checkpoint();
    recipe.title = 'modified';
    editRecipe.next(recipe);

    const guardPromise = TestBed.runInInjectionContext(() =>
      dirtyRecipeGuard(dummyRoute, fakeRouterState('/')),
    ) as Promise<boolean>;

    await fixture.whenStable();
    const dialog = await loader.getHarness(MatDialogHarness);
    const okButtonHarness = await dialog.getHarness(MatButtonHarness.with({ text: 'Ok' }));
    await okButtonHarness.click();
    await fixture.whenStable();

    const guardResult = await guardPromise;
    expect(guardResult).toBeTrue();
  });
});
