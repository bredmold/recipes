import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HomeComponent} from './home.component';
import {RecipeService} from "../recipe.service";
import {Recipe} from "../types/recipe";

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let recipeServiceSpy: any;

  beforeEach(async () => {
    recipeServiceSpy = {
      clearActiveRecipes: jasmine.createSpy('clearActiveRecipes'),
      listRecipes: jasmine.createSpy('listRecipes'),
    }
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: RecipeService,
          useValue: recipeServiceSpy
        }
      ],
      declarations: [HomeComponent],
    }).compileComponents();
  });

  function createComponent2() {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function createComponent(recipes: Recipe[]) {
    recipeServiceSpy.listRecipes.and.returnValue(Promise.resolve(recipes));
    createComponent2();
  }

  function createComponentFailure(error: string) {
    recipeServiceSpy.listRecipes.and.returnValue(Promise.reject(error));
    createComponent2();
  }

  it('should create', () => {
    createComponent([]);
    expect(component).toBeTruthy();
  });

  it('should generate an appropriate recipe link', () => {
    createComponent([]);
    const link = component.recipeLink('testid')
    expect(link).toBe('recipe/testid');
  });

  it('should set the active recipe', async () => {
    createComponent([new Recipe('title', 'desc', [], [])]);
    await fixture.whenStable();

    expect(component.allRecipes).toHaveSize(1);
  });

  it('should not fail on error', async () => {
    createComponentFailure('test case');
    await fixture.whenStable();

    expect(recipeServiceSpy.clearActiveRecipes.calls.count()).toEqual(1);
  });
});
