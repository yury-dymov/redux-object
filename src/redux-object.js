import keys from 'lodash/keys';
import has from 'lodash/has';
import assign from 'lodash/assign';
import isArray from 'lodash/isArray';
import isNull from 'lodash/isNull';

/* eslint no-use-before-define: [1, 'nofunc'] */
function buildRelationship(reducer, target, relationship, options) {
  const { eager, ignoreLinks } = options;
  const rel = target.relationships[relationship];

  if (typeof rel.data !== 'undefined') {
    if (isArray(rel.data)) {
      return rel.data.map(child => build(reducer, child.type, child.id), eager, ignoreLinks);
    } else if (isNull(rel.data)) {
      return null;
    }
    return build(reducer, rel.data.type, rel.data.id, eager,ignoreLinks);
  } else if (!ignoreLinks && rel.links) {
    throw new Error(`
      Remote lazy loading is not implemented for redux-object. 
      Please refer https://github.com/yury-dymov/json-api-normalizer/issues/2.
      If you would like to disable this error, provide 'ingoreLinks: true' option to the build function like below:
      build(reducer, type, id, { ignoreLinks: true })
    `);
  }

  return [];
}


export default function build(reducer, objectName, id = null, providedOpts = {}) {
  const defOpts = { eager: false, ignoreLinks: false };
  const options = assign({}, defOpts, providedOpts);
  const { eager, ignoreLinks } = options;

  if (!reducer[objectName]) {
    return null;
  }

  if (id === null || Array.isArray(id)) {
    const idList = id || keys(reducer[objectName]);
    return idList.map(e => build(reducer, objectName, e, eager, ignoreLinks));
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
        ret[relationship] = buildRelationship(reducer, target, relationship, eager, ignoreLinks);
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

              ret[field] = buildRelationship(reducer, target, relationship, eager, ignoreLinks);

              return ret[field];
            },
          },
        );
      }
    });
  }

  if (!has(ret, 'id')) {
    ret.id = ids;
  }

  return ret;
}

