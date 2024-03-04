import { Sorting } from "./decorators/sorting-params.decorator";
import { Filtering, FilterRule } from "./decorators/filtering-params.decorator";
import { Between, ILike, In, IsNull, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Not } from "typeorm";

export const getOrder = (sort: Sorting) => sort ? { [sort.property]: sort.direction } : {};

export const getWhere = (filter: Filtering[]) => {
  if (!filter) return {};
  const where = [];

  filter.forEach((filter) => {
    if (filter.rule == FilterRule.IS_NULL) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push({ [entity]: { [property]: IsNull() } });
      } else where.push({ [filter.property]: IsNull() });
    }
    if (filter.rule == FilterRule.IS_NOT_NULL) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push({ [entity]: { [property]: Not(IsNull()) } });
      } else where.push({ [filter.property]: Not(IsNull()) });
    }
    if (filter.rule == FilterRule.EQUALS) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push({ [entity]: { [property]: filter.value } });
      } else where.push({ [filter.property]: filter.value });
    }
    if (filter.rule == FilterRule.NOT_EQUALS) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push({ [entity]: { [property]: Not(filter.value) } });
      } else where.push({ [filter.property]: Not(filter.value) });
    }
    if (filter.rule == FilterRule.GREATER_THAN) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push({ [entity]: { [property]: MoreThan(filter.value) } });
      } else where.push({ [filter.property]: MoreThan(filter.value) });
    }
    if (filter.rule == FilterRule.GREATER_THAN_OR_EQUALS) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push({ [entity]: { [property]: MoreThanOrEqual(filter.value) } });
      } else where.push({ [filter.property]: MoreThanOrEqual(filter.value) });
    }
    if (filter.rule == FilterRule.LESS_THAN) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push({ [entity]: { [property]: LessThan(filter.value) } });
      } else where.push({ [filter.property]: LessThan(filter.value) });
    }
    if (filter.rule == FilterRule.LESS_THAN_OR_EQUALS) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push({ [entity]: { [property]: LessThanOrEqual(filter.value) } });
      }else where.push({ [filter.property]: LessThanOrEqual(filter.value) });
    }
    if (filter.rule == FilterRule.LIKE) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push({ [entity]: { [property]: ILike(`%${filter.value}%`) } });
      } else where.push({ [filter.property]: ILike(`%${filter.value}%`) });
    }
    if (filter.rule == FilterRule.NOT_LIKE) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push({ [entity]: { [property]: Not(ILike(`%${filter.value}%`)) } });
      } else where.push({ [filter.property]: Not(ILike(`%${filter.value}%`)) });
    }
    if (filter.rule == FilterRule.IN) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push({ [entity]: { [property]: In(filter.value.split(",")) } });
      } else where.push({ [filter.property]: In(filter.value.split(",")) });
    }
    if (filter.rule == FilterRule.NOT_IN) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push({ [entity]: { [property]: Not(In(filter.value.split(","))) } });
      } else where.push({ [filter.property]: Not(In(filter.value.split(","))) });
    }
    if (filter.rule == FilterRule.BETWEEN) {
      const [from, to] = filter.value.split(",");
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push({ [entity]: { [property]: Between(from, to) } });
      } else where.push({ [filter.property]: Between(from, to) });
    }
  });
  let returned = {};
  where.forEach((whereClause) => {
    returned = { ...returned, ...whereClause };
  })

  //return where;
  return returned;
}