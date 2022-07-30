import { FieldError } from "../generated/graphql";

export const errorConverter = (error: FieldError[]) => {
  const errors: Record<string, string> = {};

  error.forEach((element) => {
    errors[element.field] = element.message;
  });
  return errors;
};
