import keys from 'lodash/keys';
import has from 'lodash/has';

export default function build(reducer, objectName, id) {
  const ids = id.toString();
  const ret = {};
  const target = reducer[objectName][ids];

  if (target) {
    keys(target.attributes).forEach((key) => { ret[key] = target.attributes[key]; });

    if (target.relationships) {
      keys(target.relationships).forEach((relationship) => {
        Object.defineProperty(
          ret,
          relationship,
          {
            get: () => {
              const field = `__${relationship}`;

              if (ret[field]) {
                return ret[field];
              }

              const rel = target.relationships[relationship];
              if (rel.id) {
                const ids = rel.id.split(',');

                if (ids.length === 1) {
                  ret[field] = build(reducer, rel.type, ids[0]);
                } else {
                  ret[field] = ids.map(childId => build(reducer, rel.type, childId));
                }
              } else {
                if (rel.links) {
                  throw new Error('Remote lazy loading is not implemented for redux-object. Please refer https://github.com/yury-dymov/json-api-normalizer/issues/2');
                }

                ret[field] = [];
              }

              return ret[field];
            },
          },
        );
      });
    }
  }

  if (!has(ret, 'id')) {
    ret.id = ids;
  }

  return ret;
}
