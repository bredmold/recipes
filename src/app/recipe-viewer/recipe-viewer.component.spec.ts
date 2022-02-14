import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RecipeViewerComponent} from './recipe-viewer.component';
import {ActivatedRoute} from '@angular/router';
import {ActivatedRouteStub} from "../../testing/activated-route-stub";
import {Recipe} from "../types/recipe";
import {RecipeService} from "../recipe.service";

describe('RecipeViewerComponent', () => {
  let component: RecipeViewerComponent;
  let fixture: ComponentFixture<RecipeViewerComponent>;
  let activeRoute: ActivatedRouteStub;
  let recipeServiceSpy: any;

  beforeEach(async () => {
    activeRoute = new ActivatedRouteStub();

    recipeServiceSpy = {
      setViewRecipe: jasmine.createSpy('setViewRecipe'),
      getRecipeById: jasmine.createSpy('getRecipeById'),
    };
    recipeServiceSpy.getRecipeById.and.returnValue(Promise.reject('nope'));

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activeRoute,
        },
        {
          provide: RecipeService,
          useValue: recipeServiceSpy,
        },
      ],
      declarations: [RecipeViewerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should activate a recipe', async () => {
    const recipe = new Recipe('title', 'desc', [], []);
    recipeServiceSpy.getRecipeById.withArgs(recipe.id).and.returnValue(Promise.resolve(recipe));

    activeRoute.setParamMap({id: recipe.id});
    await fixture.whenStable();

    expect(component.recipe).toEqual(recipe);

    expect(component.ingredients()).toEqual([]);
    expect(component.steps()).toEqual([]);
  });
});
