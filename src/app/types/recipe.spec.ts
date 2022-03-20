import {Recipe, RecipeIngredient, RecipeStep, UsVolumeUnit, VolumeAmount} from './recipe';

describe('VolumeAmount', () => {
  it('should convert tablespoons to teaspoons', () => {
    const tbsp = new VolumeAmount(1, UsVolumeUnit.TableSpoon);
    expect(tbsp.convertTo(UsVolumeUnit.Teaspoon)).toEqual(new VolumeAmount(3, UsVolumeUnit.Teaspoon));
  });

  it('should convert correctly to persistence format', () => {
    expect(new VolumeAmount(2, UsVolumeUnit.Teaspoon).toObject()).toEqual({ quantity: 2, units: 'tsp' });
    expect(new VolumeAmount(1.5, UsVolumeUnit.TableSpoon).toObject()).toEqual({ quantity: 1.5, units: 'tbsp' });
    expect(new VolumeAmount(6, UsVolumeUnit.Ounce).toObject()).toEqual({ quantity: 6, units: 'oz' });
    expect(new VolumeAmount(12, UsVolumeUnit.Cup).toObject()).toEqual({ quantity: 12, units: 'cup' });
    expect(new VolumeAmount(2, UsVolumeUnit.Pint).toObject()).toEqual({ quantity: 2, units: 'pint' });
    expect(new VolumeAmount(1, UsVolumeUnit.Quart).toObject()).toEqual({ quantity: 1, units: 'qt' });
  });

  it('should restore correctly from persistence format', () => {
    expect(VolumeAmount.fromObject({ quantity: 2, units: 'tsp' })).toEqual(new VolumeAmount(2, UsVolumeUnit.Teaspoon));
    expect(
      VolumeAmount.fromObject({
        quantity: 1.5,
        units: 'tbsp',
      })
    ).toEqual(new VolumeAmount(1.5, UsVolumeUnit.TableSpoon));
    expect(VolumeAmount.fromObject({ quantity: 6, units: 'oz' })).toEqual(new VolumeAmount(6, UsVolumeUnit.Ounce));
    expect(VolumeAmount.fromObject({ quantity: 12, units: 'cup' })).toEqual(new VolumeAmount(12, UsVolumeUnit.Cup));
    expect(VolumeAmount.fromObject({ quantity: 2, units: 'pint' })).toEqual(new VolumeAmount(2, UsVolumeUnit.Pint));
    expect(VolumeAmount.fromObject({ quantity: 1, units: 'qt' })).toEqual(new VolumeAmount(1, UsVolumeUnit.Quart));
  });

  it('should render fractions', () => {
    expect(new VolumeAmount(0.25, UsVolumeUnit.Cup).render()).toEqual("¼ cup");
    expect(new VolumeAmount(0.5, UsVolumeUnit.Cup).render()).toEqual("½ cup");
    expect(new VolumeAmount(0.75, UsVolumeUnit.Cup).render()).toEqual("¾ cup");
    expect(new VolumeAmount(1, UsVolumeUnit.Cup).render()).toEqual("1 cup");
    expect(new VolumeAmount(1.5, UsVolumeUnit.Cup).render()).toEqual("1 ½ cup");
  });
});

describe('RecipeIngredient', () => {
  it('should convert to persistence format', () => {
    expect(
      new RecipeIngredient(
        'test ingredient',
        'test desc',
        new VolumeAmount(1, UsVolumeUnit.Quart),
        'test id'
      ).toObject()
    ).toEqual({
      id: 'test id',
      name: 'test ingredient',
      description: 'test desc',
      volumeAmount: {
        quantity: 1,
        units: 'qt',
      },
    });
  });

  it('should restore from persistence format', () => {
    expect(
      RecipeIngredient.fromObject({
        id: 'test id',
        name: 'test ingredient',
        description: 'test desc',
        volumeAmount: {
          quantity: 1,
          units: 'qt',
        },
      })
    ).toEqual(new RecipeIngredient('test ingredient', 'test desc', new VolumeAmount(1, UsVolumeUnit.Quart), 'test id'));
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
    ).toEqual(new Recipe('test title', 'test desc', [], [], 'test id'));
  });
});
