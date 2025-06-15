// TODO This definition needs to be shared between front-end and back-end code bases
export interface RecipeInput {
  title: string;
  description?: string;
}

export interface RecipeOutput extends RecipeInput {
  id: string;
}
