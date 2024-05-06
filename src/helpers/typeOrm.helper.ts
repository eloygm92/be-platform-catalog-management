import { Sorting } from "./decorators/sorting-params.decorator";
import { Filtering, FilterRule } from "./decorators/filtering-params.decorator";
import { Between, ILike, In, IsNull, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Not } from "typeorm";

export const getOrder = (sort: Sorting) => sort ? { [sort.property]: sort.direction } : {};

export const getWhere = (filter: Filtering[]) => {
  if (!filter) return {};
  const where = [];
  let queryBuildReturn = []

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
        queryBuildReturn.push([ `${filter.property} IN (:...${property})`, { [property]: filter.value.split(",") } ]);
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

export const getWhereQB = (filter: Filtering[]) => {
  if (!filter) return '';
  const where = [];

  filter.forEach((filter) => {
    if (filter.rule == FilterRule.IS_NULL) {
      where.push([ `${filter.property} ${FilterRule.IS_NULL}` ]);
    }
    if (filter.rule == FilterRule.IS_NOT_NULL) {
      where.push([ `${filter.property} ${FilterRule.IS_NOT_NULL}` ]);
    }
    if (filter.rule == FilterRule.EQUALS) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push([ `${filter.property} = :${entity}`, { [entity]: filter.value } ]);
      } else where.push([ `${filter.property} = :${filter.property}`, { [filter.property]: filter.value } ]);
    }
    if (filter.rule == FilterRule.NOT_EQUALS) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push([ `${filter.property} != :${entity}`, { [entity]: filter.value } ]);
      } else where.push([ `${filter.property} != :${filter.property}`, { [filter.property]: filter.value } ]);
    }
    if (filter.rule == FilterRule.GREATER_THAN) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push([ `${filter.property} > :${entity}`, { [entity]: filter.value } ]);
      } else where.push([ `${filter.property} > :${filter.property}`, { [filter.property]: filter.value } ]);
    }
    if (filter.rule == FilterRule.GREATER_THAN_OR_EQUALS) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push([ `${filter.property} >= :${entity}`, { [entity]: filter.value } ]);
      } else where.push([ `${filter.property} >= :${filter.property}`, { [filter.property]: filter.value } ]);
    }
    if (filter.rule == FilterRule.LESS_THAN) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push([ `${filter.property} < :${entity}`, { [entity]: filter.value } ]);
      } else where.push([ `${filter.property} < :${filter.property}`, { [filter.property]: filter.value } ]);
    }
    if (filter.rule == FilterRule.LESS_THAN_OR_EQUALS) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push([ `${filter.property} <= :${entity}`, { [entity]: filter.value } ]);
      }else where.push([ `${filter.property} <= :${filter.property}`, { [filter.property]: filter.value } ]);
    }
    if (filter.rule == FilterRule.LIKE) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push([ `${filter.property} LIKE :${entity}`, { [entity]: '%'+filter.value+'%' } ]);
      } else {
        where.push([`${filter.property} LIKE :${filter.property}`, { [filter.property]: '%'+filter.value+'%' }]);
      }
    }
    if (filter.rule == FilterRule.NOT_LIKE) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push([ `${filter.property} NOT LIKE :${entity}`, { [entity]: '%'+filter.value+'%' } ]);
      } else where.push([ `${filter.property} NOT LIKE :${filter.property}`, { [filter.property]: '%'+filter.value+'%' } ]);
    }
    if (filter.rule == FilterRule.IN) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push([ `${filter.property} IN (:...${entity})`, { [entity]: filter.value.split(",") } ]);
      } else where.push([ `${filter.property} IN (:...${filter.property})`, { [filter.property]: filter.value.split(",") } ]);
    }
    if (filter.rule == FilterRule.NOT_IN) {
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push([ `${filter.property} NOT IN (:...${entity})`, { [entity]: filter.value } ]);
      } else where.push([ `${filter.property} NOT IN (:...${filter.property})`, { [filter.property]: filter.value } ]);
    }
    if (filter.rule == FilterRule.BETWEEN) {
      const [from, to] = filter.value.split(",");
      if (filter.property.includes('.')) {
        const [entity, property] = filter.property.split('.');
        where.push([ `${filter.property} BETWEEN :${entity}A AND :${entity}B`, { [`${entity}A`]: from, [`${entity}B`]: to } ]);
      } else where.push([ `${filter.property} BETWEEN :${filter.property}A AND :${filter.property}B`, { [`${filter.property}A`]: from, [`${filter.property}B`]: to } ]);
    }
  });

  let returnedQB = ['' , {}];
  where.forEach((whereClause) => {
    if(returnedQB[0] == '') returnedQB = [whereClause[0], whereClause[1]];
    else returnedQB = [`${returnedQB[0]} AND ${whereClause[0]}`, { ...returnedQB[1], ...whereClause[1] }];
  })

  return returnedQB;
}