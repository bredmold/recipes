// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const UsVolumeUnits = {
  "TEASPOON": "TEASPOON",
  "TABLESPOON": "TABLESPOON",
  "OUNCE": "OUNCE",
  "CUP": "CUP",
  "PINT": "PINT",
  "QUART": "QUART"
};

const { Recipe, VolumeAmount, RecipeIngredient, RecipeStep } = initSchema(schema);

export {
  Recipe,
  UsVolumeUnits,
  VolumeAmount,
  RecipeIngredient,
  RecipeStep
};