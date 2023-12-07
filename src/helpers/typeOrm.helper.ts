import { Sorting } from "./decorators/sorting-params.decorator";
import { Filtering, FilterRule } from "./decorators/filtering-params.decorator";
import { ILike, In, IsNull, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Not } from "typeorm";

export const getOrder = (sort: Sorting) => sort ? { [sort.property]: sort.direction } : {};

export const getWhere = (filter: Filtering[]) => {
  if (!filter) return {};
  const where = [];

  filter.forEach((filter) => {
    if (filter.rule == FilterRule.IS_NULL) where.push({ [filter.property]: IsNull() });
    if (filter.rule == FilterRule.IS_NOT_NULL) where.push({ [filter.property]: Not(IsNull()) });
    if (filter.rule == FilterRule.EQUALS) where.push({ [filter.property]: filter.value });
    if (filter.rule == FilterRule.NOT_EQUALS) where.push({ [filter.property]: Not(filter.value) });
    if (filter.rule == FilterRule.GREATER_THAN) where.push({ [filter.property]: MoreThan(filter.value) });
    if (filter.rule == FilterRule.GREATER_THAN_OR_EQUALS) where.push({ [filter.property]: MoreThanOrEqual(filter.value) });
    if (filter.rule == FilterRule.LESS_THAN) where.push({ [filter.property]: LessThan(filter.value) });
    if (filter.rule == FilterRule.LESS_THAN_OR_EQUALS) where.push({ [filter.property]: LessThanOrEqual(filter.value) });
    if (filter.rule == FilterRule.LIKE) where.push({ [filter.property]: ILike(`%${filter.value}%`) });
    if (filter.rule == FilterRule.NOT_LIKE) where.push({ [filter.property]: Not(ILike(`%${filter.value}%`)) });
    if (filter.rule == FilterRule.IN) where.push({ [filter.property]: In(filter.value.split(',')) });
    if (filter.rule == FilterRule.NOT_IN) where.push({ [filter.property]: Not(In(filter.value.split(','))) });
  });
  return where;
}