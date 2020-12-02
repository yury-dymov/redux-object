### Version 1.0.0 (2nd December 2020)
Deps update

### Version 0.5.10 (17th June 2019)
Updated vulnerable deps

### Version 0.5.9 (17th January 2019)
Deps update; istanbul -> nyc for code coverage reporting

### Version 0.5.8 (16th January 2019)
Introduced `resolved` property (https://github.com/yury-dymov/redux-object/pull/38)

### Version 0.5.7 (16th November 2018)
Added support for links (https://github.com/yury-dymov/redux-object/pull/37). Updated vulnerable deps

### Version 0.5.6 (29th March 2018)
Added support for immutable.js (https://github.com/yury-dymov/redux-object/pull/34)

### Version 0.5.5 (2nd January 2018)
Fixes bug, when object doesn't have any attributes (https://github.com/yury-dymov/redux-object/pull/32)

### Version 0.5.4 (5th November 2017)
Private cache attributes are not enumerable for object returned by `build` (https://github.com/yury-dymov/redux-object/pull/31)

### Version 0.5.3 (3d November 2017)
Object properties are enumerable (https://github.com/yury-dymov/redux-object/pull/25)

### Version 0.5.2 (25th September 2017)
Added 'meta' support per spec (https://github.com/yury-dymov/redux-object/issues/22)

### Version 0.5.1 (12th September 2017)
Fixed returning empty array for relationships without data when ignoreLinks is true (https://github.com/yury-dymov/redux-object/issues/20)

### Version 0.5.0 (13th July 2017)
Accessing related object not in the store returning id instead of null if related object is not loaded but id is available (https://github.com/yury-dymov/redux-object/issues/18)

### Version 0.4.5 (09th July 2017)
Type is optionally propogated to objects (https://github.com/yury-dymov/redux-object/issues/16)

### Version 0.4.4 (26th May 2017)
Added unminified version for development https://github.com/yury-dymov/redux-object/issues/15

### Version 0.4.2 (6th May 2017)
Removed `lodash` from dependencies

### Version 0.4.1 (5th May 2017)
Added options to disable lazy loading behavior for relationships and to suppress throwing error for remote relationships
