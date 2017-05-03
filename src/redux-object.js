import keys from 'lodash/keys';
import has from 'lodash/has';
import isArray from 'lodash/isArray';
import isNull from 'lodash/isNull';

/* eslint no-use-before-define: [1, 'nofunc'] */
function buildRelationship(reducer, target, relationship) {
  const rel = target.relationships[relationship];

  if (typeof rel.data !== 'undefined') {
    if (isArray(rel.data)) {
      return rel.data.map(child => build(reducer, child.type, child.id));
    } else if (isNull(rel.data)) {
      return null;
    }
    return build(reducer, rel.data.type, rel.data.id);
  }

  if (rel.links) {
    throw new Error('Remote lazy loading is not implemented for redux-object. Please refer https://github.com/yury-dymov/json-api-normalizer/issues/2');
  }

  return [];
}


export default function build(reducer, objectName, id = null, eager = false) {
  if (id === null) {
    return keys(reducer[objectName]).map(e => build(reducer, objectName, e, eager));
  } else if (Array.isArray(id)) {
    return id.map(e => build(reducer, objectName, e, eager));
  }

  const ids = id.toString();
  const ret = {};
  const target = reducer[objectName][ids];

  if (!target) {
    return null;
  }

  if (target.id) {
    ret.id = target.id;
  }

  keys(target.attributes).forEach((key) => { ret[key] = target.attributes[key]; });

  if (target.relationships) {
    keys(target.relationships).forEach((relationship) => {
      if (eager) {
        ret[relationship] = buildRelationship(reducer, target, relationship);
      } else {
        Object.defineProperty(
          ret,
          relationship,
          {
            get: () => {
              const field = `__${relationship}`;

              if (ret[field]) {
                return ret[field];
              }

              ret[field] = buildRelationship(reducer, target, relationship);

              return ret[field];
            },
          }
        );
      }
    });
  }

  if (!has(ret, 'id')) {
    ret.id = ids;
  }

  return ret;
}

