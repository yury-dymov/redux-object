/* eslint no-use-before-define: [1, 'nofunc'] */
function buildRelationship(reducer, target, relationship, options) {
  const { ignoreLinks, parentTree } = options;
  const rel = target.relationships[relationship];

  if (typeof rel.data !== 'undefined') {
    if (Array.isArray(rel.data)) {
      return rel.data.map((child) => {
        if (parentTree.indexOf(child.type) !== -1) {
          return null;
        }
        return build(reducer, child.type, child.id, options);
      });
    } else if (rel.data === null || parentTree.indexOf(rel.data.type) !== -1) {
      return null;
    }
    return build(reducer, rel.data.type, rel.data.id, options);
  } else if (!ignoreLinks && rel.links) {
    throw new Error('Remote lazy loading is not supported (see: https://github.com/yury-dymov/json-api-normalizer/issues/2). To disable this error, include option \'ignoreLinks: true\' in the build function like so: build(reducer, type, id, { ignoreLinks: true })');
  }

  return [];
}


export default function build(reducer, objectName, id = null, providedOpts = {}) {
  const defOpts = { eager: false, ignoreLinks: false, parentTree: [] };
  const options = Object.assign({}, defOpts, providedOpts);
  const { eager } = options;

  if (!reducer[objectName]) {
    return null;
  }

  if (id === null || Array.isArray(id)) {
    const idList = id || Object.keys(reducer[objectName]);
    return idList.map(e => build(reducer, objectName, e, options));
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

  Object.keys(target.attributes).forEach((key) => { ret[key] = target.attributes[key]; });

  if (target.relationships) {
    Object.keys(target.relationships).forEach((relationship) => {
      if (eager) {
        options.parentTree.push(objectName);
        ret[relationship] = buildRelationship(reducer, target, relationship, options);
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

              ret[field] = buildRelationship(reducer, target, relationship, options);

              return ret[field];
            },
          },
        );
      }
    });
  }

  if (typeof ret.id === 'undefined') {
    ret.id = ids;
  }

  return ret;
}
