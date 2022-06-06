import { QuantityUnitInformation, Recipe, RecipeAmount, RecipeIngredient, RecipeStep, UnitsKind } from './recipe';

/*
Convenience functions for testing
 */
const abbr = (abbreviation: string) => QuantityUnitInformation.parse(UnitsKind.UsVolume, abbreviation);
const weight = (abbreviation: string) => QuantityUnitInformation.parse(UnitsKind.UsWeight, abbreviation);
const amount = (q: number, u: string, k: string) => RecipeAmount.fromObject({ quantity: q, units: u, kind: k }, '2');

describe('QuantityUnitInformation', () => {
  it('should throw when parsing an invalid abbreviation', () => {
    expect(() => QuantityUnitInformation.parse(UnitsKind.UsVolume, 'nope')).toThrow(
      'Invalid units: kind=UsVolume abbreviation=nope'
    );
  });

  it('should parse an arbitrary unit', () => {
    expect(QuantityUnitInformation.parse(UnitsKind.Arbitrary, 'test')).toEqual({
      kind: UnitsKind.Arbitrary,
      name: 'test',
      abbreviation: 'test',
      conversionFactor: 1,
    });
  });
});

describe('RecipeAmount', () => {
  it('should convert units', () => {
    expect(new RecipeAmount(1, abbr('tbsp')).convertTo(abbr('tsp'))).toEqual(new RecipeAmount(3, abbr('tsp')));
    expect(new RecipeAmount(1, abbr('cup')).convertTo(abbr('oz'))).toEqual(new RecipeAmount(8, abbr('oz')));
    expect(new RecipeAmount(1, abbr('pint')).convertTo(abbr('cup'))).toEqual(new RecipeAmount(2, abbr('cup')));
    expect(new RecipeAmount(1, abbr('qt')).convertTo(abbr('cup'))).toEqual(new RecipeAmount(4, abbr('cup')));
    expect(new RecipeAmount(1, weight('lbs')).convertTo(weight('oz'))).toEqual(new RecipeAmount(16, weight('oz')));
  });

  it('should throw when attempting to convert weight weight to volume', () => {
    const poundsAmount = new RecipeAmount(1, weight('lbs'));
    expect(() => poundsAmount.convertTo(abbr('oz'))).toThrow("Can't convert from UsWeight to UsVolume");
  });

  it('should throw when attempting to convert arbitrary units', () => {
    const unit: QuantityUnitInformation = {
      kind: UnitsKind.Arbitrary,
      name: 'test unit',
      abbreviation: 'test',
      conversionFactor: 1,
    };
    expect(() => new RecipeAmount(1, unit).convertTo(unit)).toThrow("Can't convert arbitrary units");
  });

  it('should convert correctly to persistence format', () => {
    expect(new RecipeAmount(2, abbr('tsp')).toObject()).toEqual({ quantity: 2, units: 'tsp', kind: 'UsVolume' });
    expect(new RecipeAmount(1.5, abbr('tbsp')).toObject()).toEqual({ quantity: 1.5, units: 'tbsp', kind: 'UsVolume' });
    expect(new RecipeAmount(6, abbr('oz')).toObject()).toEqual({ quantity: 6, units: 'oz', kind: 'UsVolume' });
    expect(new RecipeAmount(12, abbr('cup')).toObject()).toEqual({ quantity: 12, units: 'cup', kind: 'UsVolume' });
    expect(new RecipeAmount(2, abbr('pint')).toObject()).toEqual({ quantity: 2, units: 'pint', kind: 'UsVolume' });
    expect(new RecipeAmount(1, abbr('qt')).toObject()).toEqual({ quantity: 1, units: 'qt', kind: 'UsVolume' });
  });

  it('should restore correctly from persistence format v1', () => {
    expect(
      RecipeAmount.fromObject(
        {
          quantity: 2,
          units: 'tsp',
        },
        '1'
      )
    ).toEqual(new RecipeAmount(2, abbr('tsp')));
    expect(
      RecipeAmount.fromObject(
        {
          quantity: 1.5,
          units: 'tbsp',
        },
        '1'
      )
    ).toEqual(new RecipeAmount(1.5, abbr('tbsp')));
    expect(RecipeAmount.fromObject({ quantity: 6, units: 'oz' }, '1')).toEqual(new RecipeAmount(6, abbr('oz')));
    expect(RecipeAmount.fromObject({ quantity: 12, units: 'cup' }, '1')).toEqual(new RecipeAmount(12, abbr('cup')));
    expect(RecipeAmount.fromObject({ quantity: 2, units: 'pint' }, '1')).toEqual(new RecipeAmount(2, abbr('pint')));
    expect(RecipeAmount.fromObject({ quantity: 1, units: 'qt' }, '1')).toEqual(new RecipeAmount(1, abbr('qt')));
  });

  it('should restore correctly from persistence format v2', () => {
    expect(amount(2, 'tsp', 'UsVolume')).toEqual(new RecipeAmount(2, abbr('tsp')));
    expect(amount(1.5, 'tbsp', 'UsVolume')).toEqual(new RecipeAmount(1.5, abbr('tbsp')));
    expect(amount(6, 'oz', 'UsVolume')).toEqual(new RecipeAmount(6, abbr('oz')));
    expect(amount(12, 'cup', 'UsVolume')).toEqual(new RecipeAmount(12, abbr('cup')));
    expect(amount(2, 'pint', 'UsVolume')).toEqual(new RecipeAmount(2, abbr('pint')));
    expect(amount(1, 'qt', 'UsVolume')).toEqual(new RecipeAmount(1, abbr('qt')));
    expect(amount(1, 'lbs', 'UsWeight')).toEqual(new RecipeAmount(1, weight('lbs')));
    expect(amount(5, 'oz', 'UsWeight')).toEqual(new RecipeAmount(5, weight('oz')));
  });

  it('should throw with an invalid units kind', () => {
    expect(() => amount(1, 'lbs', 'Test')).toThrow('Invalid units kind: Test');
  });

  it('should render fractions', () => {
    expect(new RecipeAmount(0.2, abbr('cup')).render()).toEqual('0.2 cup');
    expect(new RecipeAmount(0.25, abbr('cup')).render()).toEqual('¼ cup');
    expect(new RecipeAmount(0.33, abbr('cup')).render()).toEqual('⅓ cup');
    expect(new RecipeAmount(0.5, abbr('cup')).render()).toEqual('½ cup');
    expect(new RecipeAmount(0.67, abbr('cup')).render()).toEqual('⅔ cup');
    expect(new RecipeAmount(0.75, abbr('cup')).render()).toEqual('¾ cup');
    expect(new RecipeAmount(1, abbr('cup')).render()).toEqual('1 cup');
    expect(new RecipeAmount(1.5, abbr('cup')).render()).toEqual('1 ½ cup');
  });
});

describe('RecipeIngredient', () => {
  it('should convert to persistence format', () => {
    expect(
      new RecipeIngredient('test ingredient', 'test desc', new RecipeAmount(1, abbr('qt')), 'test id').toObject()
    ).toEqual({
      id: 'test id',
      name: 'test ingredient',
      description: 'test desc',
      amount: {
        quantity: 1,
        units: 'qt',
        kind: 'UsVolume',
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
        '1'
      )
    ).toEqual(new RecipeIngredient('test ingredient', 'test desc', new RecipeAmount(1, abbr('qt')), 'test id'));
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
            units: 'qt',
            kind: 'UsVolume',
          },
        },
        '2'
      )
    ).toEqual(new RecipeIngredient('test ingredient', 'test desc', new RecipeAmount(1, abbr('qt')), 'test id'));
  });

  it('should render an ingredient', () => {
    expect(new RecipeIngredient('test', '', new RecipeAmount(1, abbr('tsp'))).render()).toEqual('1 tsp test');
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
      })
    ).toEqual(new RecipeStep('test desc', ['ingredient id 1'], 'test id'));
  });
});

describe('Recipe', () => {
  it('should convert to persistence format', () => {
    expect(new Recipe('test title', 'test desc', [], [], 'test id').toObject()).toEqual({
      id: 'test id',
      title: 'test title',
      description: 'test desc',
      steps: [],
      ingredients: [],
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
      })
    ).toEqual(new Recipe('test title', 'test desc', [], [], 'test id', '1'));
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
      })
    ).toThrow('Invalid version string: nope');
  });
});
