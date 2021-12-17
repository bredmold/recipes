import {TestBed} from '@angular/core/testing';

import {RecipeService, UsVolumeUnit, VolumeAmount} from "./recipe.service";

describe('RecipeService', () => {
  let service: RecipeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecipeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe("VolumeAmount", () => {
  it("should convert tablespoons to teaspoons", () => {
    const tbsp = new VolumeAmount(1, UsVolumeUnit.TableSpoon);
    expect(tbsp.convertTo(UsVolumeUnit.Teaspoon))
      .toEqual(new VolumeAmount(3, UsVolumeUnit.Teaspoon));
  });
});
