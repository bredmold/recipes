import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeViewerComponent } from './recipe-viewer.component';
import { ActivatedRoute } from '@angular/router';
import { ActivatedRouteStub } from '../../testing/activated-route-stub';
import { Recipe } from '../types/recipe';
import { RecipeService } from '../services/recipe.service';
import { LayoutMode, ResponsiveLayoutService } from '../services/responsive-layout.service';
import { BehaviorSubject } from 'rxjs';

describe('RecipeViewerComponent', () => {
  let component: RecipeViewerComponent;
  let fixture: ComponentFixture<RecipeViewerComponent>;
  let activeRoute: ActivatedRouteStub;
  let recipeServiceSpy: jasmine.SpyObj<RecipeService>;
  let responsiveLayoutServiceSpy: ResponsiveLayoutService;

  beforeEach(async () => {
    activeRoute = new ActivatedRouteStub();

    recipeServiceSpy = jasmine.createSpyObj('RecipeService', ['setViewRecipe', 'getRecipeById']);
    recipeServiceSpy.getRecipeById.and.returnValue(Promise.reject('nope'));

    responsiveLayoutServiceSpy = {
      layoutMode: new BehaviorSubject<LayoutMode>(LayoutMode.TabletPortrait),
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

  describe('recipeViewerClass', () => {
    function doTest(mode: LayoutMode, readableMode: string, expected: string) {
      it(`Should return ${expected} for layout mode ${readableMode}`, () => {
        responsiveLayoutServiceSpy.layoutMode.next(mode);
        expect(component.recipeViewerClass()).toEqual(expected);
      });
    }

    doTest(LayoutMode.TabletLandscape, 'TableLandscape', 'recipe-viewer');
    doTest(LayoutMode.TabletPortrait, 'TablePortrait', 'recipe-viewer');
    doTest(LayoutMode.HandsetLandscape, 'HandsetLandscape', 'recipe-viewer-phone');
    doTest(LayoutMode.HandsetPortrait, 'HandsetPortrait', 'recipe-viewer-phone');
  });

  it('should return an empty list of steps when no recipe', () => {
    expect(component.steps()).toHaveSize(0);
  });

  it('should return an empty list of ingredients when no recipe', () => {
    expect(component.ingredients()).toHaveSize(0);
  });
});
