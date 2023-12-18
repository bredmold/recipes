import { QuantityUnitInformation, Recipe, RecipeAmount, RecipeIngredient, RecipeStep, UnitsKind } from './recipe';

/*
Convenience functions for testing
 */
const recipe = new Recipe('test', 'test', [], [], []);
const abbr = (abbreviation: string) =>
  QuantityUnitInformation.byId(`us-volume-${abbreviation}`) as QuantityUnitInformation;
const weight = (abbreviation: string) =>
  QuantityUnitInformation.byId(`us-weight-${abbreviation}`) as QuantityUnitInformation;
const amount = (q: number, u: string) => RecipeAmount.fromObject({ quantity: q, units: u }, '2', recipe);

describe('QuantityUnitInformation', () => {
  it('should return standard US weight units', () => {
    expect(QuantityUnitInformation.byKind(UnitsKind.UsWeight)).toHaveSize(2);
  });

  it('should return standard US volume units', () => {
    expect(QuantityUnitInformation.byKind(UnitsKind.UsVolume)).toHaveSize(6);
  });

  it('should retrieve standard units by ID', () => {
    expect(QuantityUnitInformation.byId('us-volume-tsp')).toBeDefined();
    expect(QuantityUnitInformation.byId('us-volume-tbsp')).toBeDefined();
    expect(QuantityUnitInformation.byId('us-volume-oz')).toBeDefined();
    expect(QuantityUnitInformation.byId('us-volume-cup')).toBeDefined();
    expect(QuantityUnitInformation.byId('us-volume-pint')).toBeDefined();
    expect(QuantityUnitInformation.byId('us-volume-qt')).toBeDefined();
    expect(QuantityUnitInformation.byId('us-weight-oz')).toBeDefined();
    expect(QuantityUnitInformation.byId('us-weight-lbs')).toBeDefined();
  });

  it('should parse arbitrary units', () => {
    expect(
      QuantityUnitInformation.fromObject({
        id: 'id',
        name: 'name',
        abbreviation: 'abbr',
      }),
    ).toEqual(new QuantityUnitInformation('id', UnitsKind.Arbitrary, 'name', 'abbr', 1));
  });

  it('should save arbitrary units', () => {
    const unit = new QuantityUnitInformation('id', UnitsKind.Arbitrary, 'name', 'abbr', 1);
    expect(QuantityUnitInformation.save(unit)).toEqual({ id: 'id', name: 'name', abbreviation: 'abbr' });
  });

  it('should throw when saving standard units', () => {
    const unit = QuantityUnitInformation.byId('us-volume-tsp') as QuantityUnitInformation;
    expect(() => QuantityUnitInformation.save(unit)).toThrow('Only custom units can be saved in a recipe (UsVolume)');
  });

  it('should throw when restoring standard units', () => {
    expect(() =>
      QuantityUnitInformation.fromObject({
        id: 'us-volume-tsp',
        name: 'name',
        abbreviation: 'abbr',
      }),
    ).toThrow('Found standard unit in custom units list: us-volume-tsp');
  });
});

describe('RecipeAmount', () => {
  it('should convert units', () => {
    expect(new RecipeAmount(1, 'us-volume-tbsp').convertTo(abbr('tsp'))).toEqual(new RecipeAmount(3, 'us-volume-tsp'));
    expect(new RecipeAmount(1, 'us-volume-cup').convertTo(abbr('oz'))).toEqual(new RecipeAmount(8, 'us-volume-oz'));
    expect(new RecipeAmount(1, 'us-volume-pint').convertTo(abbr('cup'))).toEqual(new RecipeAmount(2, 'us-volume-cup'));
    expect(new RecipeAmount(1, 'us-volume-qt').convertTo(abbr('cup'))).toEqual(new RecipeAmount(4, 'us-volume-cup'));
    expect(new RecipeAmount(1, 'us-weight-lbs').convertTo(weight('oz'))).toEqual(new RecipeAmount(16, 'us-weight-oz'));
  });

  it('should throw when attempting to convert weight weight to volume', () => {
    const poundsAmount = new RecipeAmount(1, 'us-weight-lbs');
    expect(() => poundsAmount.convertTo(abbr('oz'))).toThrow("Can't convert from UsWeight to UsVolume");
  });

  it('should throw when attempting to convert arbitrary units', () => {
    const unit: QuantityUnitInformation = {
      id: 'test',
      kind: UnitsKind.Arbitrary,
      name: 'test unit',
      abbreviation: 'test',
      conversionFactor: 1,
    };
    expect(() => new RecipeAmount(1, 'test').convertTo(unit)).toThrow("Can't convert from custom units: test");
  });

  it('should convert correctly to persistence format', () => {
    expect(new RecipeAmount(2, 'us-volume-tsp').toObject()).toEqual({ quantity: 2, units: 'us-volume-tsp' });
    expect(new RecipeAmount(1.5, 'us-volume-tbsp').toObject()).toEqual({ quantity: 1.5, units: 'us-volume-tbsp' });
    expect(new RecipeAmount(6, 'us-volume-oz').toObject()).toEqual({ quantity: 6, units: 'us-volume-oz' });
    expect(new RecipeAmount(12, 'us-volume-cup').toObject()).toEqual({ quantity: 12, units: 'us-volume-cup' });
    expect(new RecipeAmount(2, 'us-volume-pint').toObject()).toEqual({ quantity: 2, units: 'us-volume-pint' });
    expect(new RecipeAmount(1, 'us-volume-qt').toObject()).toEqual({ quantity: 1, units: 'us-volume-qt' });
  });

  it('should restore correctly from persistence format v1', () => {
    const r = new Recipe('test', 'test', [], [], []);
    expect(
      RecipeAmount.fromObject(
        {
          quantity: 2,
          units: 'tsp',
        },
        '1',
        r,
      ),
    ).toEqual(new RecipeAmount(2, 'us-volume-tsp'));
    expect(
      RecipeAmount.fromObject(
        {
          quantity: 1.5,
          units: 'tbsp',
        },
        '1',
        r,
      ),
    ).toEqual(new RecipeAmount(1.5, 'us-volume-tbsp'));
    expect(RecipeAmount.fromObject({ quantity: 6, units: 'oz' }, '1', r)).toEqual(new RecipeAmount(6, 'us-volume-oz'));
    expect(
      RecipeAmount.fromObject(
        {
          quantity: 12,
          units: 'cup',
        },
        '1',
        r,
      ),
    ).toEqual(new RecipeAmount(12, 'us-volume-cup'));
    expect(
      RecipeAmount.fromObject(
        {
          quantity: 2,
          units: 'pint',
        },
        '1',
        r,
      ),
    ).toEqual(new RecipeAmount(2, 'us-volume-pint'));
    expect(RecipeAmount.fromObject({ quantity: 1, units: 'qt' }, '1', r)).toEqual(new RecipeAmount(1, 'us-volume-qt'));
  });

  it('should restore correctly from persistence format v2', () => {
    expect(amount(2, 'us-volume-tsp')).toEqual(new RecipeAmount(2, 'us-volume-tsp'));
    expect(amount(1.5, 'us-volume-tbsp')).toEqual(new RecipeAmount(1.5, 'us-volume-tbsp'));
    expect(amount(6, 'us-volume-oz')).toEqual(new RecipeAmount(6, 'us-volume-oz'));
    expect(amount(12, 'us-volume-cup')).toEqual(new RecipeAmount(12, 'us-volume-cup'));
    expect(amount(2, 'us-volume-pint')).toEqual(new RecipeAmount(2, 'us-volume-pint'));
    expect(amount(1, 'us-volume-qt')).toEqual(new RecipeAmount(1, 'us-volume-qt'));
    expect(amount(1, 'us-weight-lbs')).toEqual(new RecipeAmount(1, 'us-weight-lbs'));
    expect(amount(5, 'us-weight-oz')).toEqual(new RecipeAmount(5, 'us-weight-oz'));
  });

  it('should throw with an invalid units id', () => {
    expect(() => amount(1, 'us-weight-nope')).toThrow('Invalid units id: us-weight-nope');
  });

  it('should render fractions', () => {
    const e = new Recipe('e', 'e', [], [], []);
    expect(new RecipeAmount(0.2, 'us-volume-cup').render(e)).toEqual('0.2 cup');
    expect(new RecipeAmount(0.25, 'us-volume-cup').render(e)).toEqual('¼ cup');
    expect(new RecipeAmount(0.33, 'us-volume-cup').render(e)).toEqual('⅓ cup');
    expect(new RecipeAmount(0.5, 'us-volume-cup').render(e)).toEqual('½ cup');
    expect(new RecipeAmount(0.67, 'us-volume-cup').render(e)).toEqual('⅔ cup');
    expect(new RecipeAmount(0.75, 'us-volume-cup').render(e)).toEqual('¾ cup');
    expect(new RecipeAmount(1, 'us-volume-cup').render(e)).toEqual('1 cup');
    expect(new RecipeAmount(1.5, 'us-volume-cup').render(e)).toEqual('1 ½ cup');
  });

  it('should throw for invalid volume units in v1 persistence', () => {
    expect(() =>
      RecipeAmount.fromObject(
        {
          quantity: 1,
          units: 'nope',
        },
        '1',
        recipe,
      ),
    ).toThrow('Invalid units abbreviation: nope');
  });
});

describe('RecipeIngredient', () => {
  it('should convert to persistence format', () => {
    expect(
      new RecipeIngredient('test ingredient', 'test desc', new RecipeAmount(1, 'us-volume-qt'), 'test id').toObject(),
    ).toEqual({
      id: 'test id',
      name: 'test ingredient',
      description: 'test desc',
      amount: {
        quantity: 1,
        units: 'us-volume-qt',
      },
    });
  });

  it('should restore from persistence format v1', () => {
    expect(
      RecipeIngredient.fromObject(
        {
          id: 'test id',
          name: 'test ingredient',
          description: 'test desc',
          volumeAmount: {
            quantity: 1,
            units: 'qt',
          },
        },
        '1',
        recipe,
      ),
    ).toEqual(new RecipeIngredient('test ingredient', 'test desc', new RecipeAmount(1, 'us-volume-qt'), 'test id'));
  });

  it('should restore from persistence format v2', () => {
    expect(
      RecipeIngredient.fromObject(
        {
          id: 'test id',
          name: 'test ingredient',
          description: 'test desc',
          amount: {
            quantity: 1,
            units: 'us-volume-qt',
          },
        },
        '2',
        recipe,
      ),
    ).toEqual(new RecipeIngredient('test ingredient', 'test desc', new RecipeAmount(1, 'us-volume-qt'), 'test id'));
  });

  it('should render an ingredient', () => {
    const e = new Recipe('e', 'e', [], [], []);
    expect(new RecipeIngredient('test', '', new RecipeAmount(1, 'us-volume-tsp')).render(e)).toEqual('1 tsp test');
  });
});

describe('RecipeStep', () => {
  it('should convert to persistence format', () => {
    expect(new RecipeStep('test desc', ['ingredient id 1'], 'test id').toObject()).toEqual({
      id: 'test id',
      description: 'test desc',
      ingredients: ['ingredient id 1'],
    });
  });

  it('should restore from persistence format', () => {
    expect(
      RecipeStep.fromObject({
        id: 'test id',
        description: 'test desc',
        ingredients: ['ingredient id 1'],
      }),
    ).toEqual(new RecipeStep('test desc', ['ingredient id 1'], 'test id'));
  });
});

describe('Recipe', () => {
  it('should convert to persistence format', () => {
    expect(new Recipe('test title', 'test desc', [], [], [], 'test id').toObject()).toEqual({
      id: 'test id',
      title: 'test title',
      description: 'test desc',
      steps: [],
      ingredients: [],
      customUnits: [],
      version: '2',
    });
  });

  it('should restore from persistence format', () => {
    expect(
      Recipe.fromObject({
        id: 'test id',
        title: 'test title',
        description: 'test desc',
        steps: [],
        ingredients: [],
      }),
    ).toEqual(new Recipe('test title', 'test desc', [], [], [], 'test id', true));
  });

  it('should find custom units', () => {
    const recipe = new Recipe(
      'test',
      'test',
      [],
      [],
      [{ id: 'id', kind: UnitsKind.Arbitrary, name: 'name', abbreviation: 'abbr', conversionFactor: 1 }],
    );

    const custom = recipe.unitsFor('id');
    expect(custom).toBeDefined();
  });

  it('should return unitsId for non-existent units', () => {
    const recipe = new Recipe('test', 'test', [], [], []);
    const abbr = recipe.abbreviationFor('nope');
    expect(abbr).toBe('nope');
  });

  it('should save all the parts of a recipe', () => {
    const recipe = new Recipe(
      'test',
      'test',
      [new RecipeStep('step', [])],
      [new RecipeIngredient('ingredient', 'desc', new RecipeAmount(1, 'us-volume-tsp'))],
      [{ id: 'id', kind: UnitsKind.Arbitrary, name: 'name', abbreviation: 'abbr', conversionFactor: 1 }],
    );

    const saved: any = recipe.toObject();
    expect(saved.steps).toHaveSize(1);
    expect(saved.ingredients).toHaveSize(1);
    expect(saved.customUnits).toHaveSize(1);
  });

  it('should restore custom units with version 2', () => {
    const recipe = Recipe.fromObject({
      title: 'title',
      description: 'desc',
      steps: [],
      ingredients: [],
      customUnits: [{ id: 'custom', name: 'name', abbreviation: 'abbr' }],
      id: 'id',
      version: '2',
    });

    expect(recipe.customUnits).toHaveSize(1);
  });

  it('should restore recipe steps', () => {
    const recipe = Recipe.fromObject({
      title: 'title',
      description: 'desc',
      steps: [{ description: 'desc', ingredients: [], id: 'step' }],
      ingredients: [],
      customUnits: [],
      id: 'id',
      version: '2',
    });

    expect(recipe.steps).toHaveSize(1);
  });

  it('should restore recipe ingredients', () => {
    const recipe = Recipe.fromObject({
      title: 'title',
      description: 'desc',
      steps: [],
      ingredients: [{ name: 'name', description: 'desc', amount: { quantity: 1, units: 'us-volume-tsp' }, id: 'id' }],
      customUnits: [],
      id: 'id',
      version: '2',
    });

    expect(recipe.ingredients).toHaveSize(1);
  });

  it('should throw when encountering an invalid recipe version', () => {
    expect(() =>
      Recipe.fromObject({
        id: 'test id',
        title: 'test title',
        description: 'test desc',
        steps: [],
        ingredients: [],
        version: 'nope',
      }),
    ).toThrow('Invalid version string: nope');
  });

  it('should create a new recipe in un-saved state', () => {
    const recipe = new Recipe('test', 'test', [], [], []);
    expect(recipe.hasBeenSaved()).toBeFalse();
  });

  it('should mark a saved recipe', () => {
    const recipe = new Recipe('test', 'test', [], [], []);
    recipe.saved();
    expect(recipe.hasBeenSaved()).toBeTrue();
  });

  it('should not have errors when newly created', () => {
    const recipe = new Recipe('test', 'test', [], [], []);
    expect(recipe.hasErrors()).toBeFalse();
  });

  it('should have errors when an error is registered', () => {
    const recipe = new Recipe('test', 'test', [], [], []);
    recipe.registerError('test');
    expect(recipe.hasErrors()).toBeTrue();
  });

  it('should no longer have errors when an existing error is cleared', () => {
    const recipe = new Recipe('test', 'test', [], [], []);

    recipe.registerError('test');
    expect(recipe.hasErrors()).toBeTrue();

    recipe.clearError('test');
    expect(recipe.hasErrors()).toBeFalse();
  });
});
