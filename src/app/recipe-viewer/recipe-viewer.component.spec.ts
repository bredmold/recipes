import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeViewerComponent } from './recipe-viewer.component';
import { ActivatedRoute } from '@angular/router';
import { ActivatedRouteStub } from '../../testing/activated-route-stub';
import { Recipe } from '../types/recipe';
import { RecipeService } from '../services/recipe.service';
import { BehaviorSubject } from 'rxjs';
import { LayoutMode, ResponsiveLayoutService } from '../services/responsive-layout.service';

describe('RecipeViewerComponent', () => {
  let component: RecipeViewerComponent;
  let fixture: ComponentFixture<RecipeViewerComponent>;
  let activeRoute: ActivatedRouteStub;
  let recipeServiceSpy: any;
  let responsiveLayoutServiceSpy: any;

  beforeEach(async () => {
    activeRoute = new ActivatedRouteStub();

    recipeServiceSpy = {
      setViewRecipe: jasmine.createSpy('setViewRecipe'),
      getRecipeById: jasmine.createSpy('getRecipeById'),
    };
    recipeServiceSpy.getRecipeById.and.returnValue(Promise.reject('nope'));

    responsiveLayoutServiceSpy = {
      layoutMode: new BehaviorSubject<LayoutMode>(LayoutMode.TableLandscape),
    };

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
        {
          provide: ResponsiveLayoutService,
          useValue: responsiveLayoutServiceSpy,
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
    const recipe = new Recipe('title', 'desc', [], [], []);
    recipeServiceSpy.getRecipeById.withArgs(recipe.id).and.returnValue(Promise.resolve(recipe));

    activeRoute.setParamMap({ id: recipe.id });
    await fixture.whenStable();

    expect(component.recipe).toEqual(recipe);

    expect(component.ingredients()).toEqual([]);
    expect(component.steps()).toEqual([]);
  });

  it('should return the table class on tables', () => {
    responsiveLayoutServiceSpy.layoutMode.next(LayoutMode.TablePortrait);
    expect(component.recipeViewerClass()).toEqual('recipe-viewer');
  });

  it('should return the phone class on phones', () => {
    responsiveLayoutServiceSpy.layoutMode.next(LayoutMode.HandsetPortrait);
    expect(component.recipeViewerClass()).toEqual('recipe-viewer-phone');
  });
});
