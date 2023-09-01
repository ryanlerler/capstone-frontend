import Filter from "bad-words";

const filter = new Filter();

export const sanitizeInput = (input) => {
  return filter.isProfane(input) ? filter.clean(input) : input;
};
