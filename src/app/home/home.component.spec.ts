import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { RecipeService } from '../services/recipe.service';
import { Recipe } from '../types/recipe';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { LayoutMode, ResponsiveLayoutService } from '../services/responsive-layout.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let recipeServiceSpy: any;
  let responsiveLayoutServiceSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    recipeServiceSpy = {
      clearActiveRecipes: jasmine.createSpy('clearActiveRecipes'),
      listRecipes: jasmine.createSpy('listRecipes'),
    };

    responsiveLayoutServiceSpy = {
      layoutMode: new BehaviorSubject<LayoutMode>(LayoutMode.TabletPortrait),
    };

    routerSpy = { navigate: jasmine.createSpy('navigate') };

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: RecipeService,
          useValue: recipeServiceSpy,
        },
        {
          provide: ResponsiveLayoutService,
          useValue: responsiveLayoutServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
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
    const link = component.recipeLink('testid');
    expect(link).toBe('recipe/testid');
  });

  it('should set the active recipe', async () => {
    createComponent([new Recipe('title', 'desc', [], [], [])]);
    await fixture.whenStable();

    expect(component.allRecipes).toHaveSize(1);
  });

  it('should not fail on error', async () => {
    createComponentFailure('test case');
    await fixture.whenStable();

    expect(recipeServiceSpy.clearActiveRecipes.calls.count()).toEqual(1);
  });

  it('should navigate to a new recipe edit screen', () => {
    createComponent([]);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    component.newRecipe();

    const navArgs = routerSpy.navigate.calls.first().args[0];
    expect(navArgs).toHaveSize(1);

    const navUri = navArgs[0] as string;
    expect(navUri).toMatch(/^\/recipe\/[a-z0-9-]{36}\/edit$/);
  });

  it('should show edit links on a tablet', () => {
    createComponent([new Recipe('title', 'desc', [], [], [])]);
    expect(component.showEditLinks()).toBeTrue();
  });

  it('should hide edit links on a phone', () => {
    createComponent([new Recipe('title', 'desc', [], [], [])]);
    responsiveLayoutServiceSpy.layoutMode.next(LayoutMode.HandsetPortrait);
    expect(component.showEditLinks()).toBeFalse();
  });
});
