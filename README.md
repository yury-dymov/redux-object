# redux-object

[![npm version](https://img.shields.io/npm/v/redux-object.svg?style=flat)](https://www.npmjs.com/package/redux-object)
[![Downloads](http://img.shields.io/npm/dm/redux-object.svg?style=flat-square)](https://npmjs.org/package/redux-object)
[![Build Status](https://img.shields.io/travis/yury-dymov/redux-object/master.svg?style=flat)](https://travis-ci.org/yury-dymov/redux-object)
[![Coverage Status](https://coveralls.io/repos/github/yury-dymov/redux-object/badge.svg?branch=master)](https://coveralls.io/github/yury-dymov/redux-object?branch=master)

Builds complex JS object from normalized redux store. Best works with [json-api-normalizer](https://github.com/yury-dymov/json-api-normalizer).

DEMO - [https://yury-dymov.github.io/json-api-react-redux-example/](https://yury-dymov.github.io/json-api-react-redux-example/)

Demo sources and description - [https://github.com/yury-dymov/json-api-react-redux-example](https://github.com/yury-dymov/json-api-react-redux-example)

# API
Library provides `build` function, which takes 4 parameters: redux state part, object type, ID or an array of IDs or null, and options.

If ID is provided in a form of array, multiple objects are fetched. If ID is null, all objects of selected type are fetched.

| Option | Default | Description |
|:--------|:---------------:|:-------------|
| eager | false | Controls lazy loading for the child relationship objects. By default, lazy loading is enabled. |
| ignoreLinks | false | redux-object doesn't support remote objects. This option suppresses the exception thrown in case user accesses a property, which is not loaded to redux store yet. |
| includeType | false | Include the record type as a property 'type' on each result. This is particularly useful for identifying the record type returned by a polymorphic relationship. |


```JavaScript
import build from 'redux-object';

/*
state:
{
  data: {
    post: {
      "2620": {
        attributes: {
          "text": "hello",
          "id": 2620
        },
        relationships: {
          daQuestion: {
            id: "295",
            type: "question"
          },
          liker: [{
              id: "1",
              type: "user"
            }, {
              id: "2",
              type: "user",
            }, {
              id: "3",
              type: "user"
            }
          ],
          comments: []
        }
      }
    },
    question: {
      "295": {
        attributes: {
          text: "hello?"
        }
      }
    },
    user: {
      "1": {
        attributes: {
          id: 1,
          name: "Alice"
        }
      },
      "2": {
        attributes: {
          id: 2,
          name: "Bob"
        }
      },
      "3": {
        attributes: {
          id: 3,
          text: "Jenny"
        }
      }
    },
    meta: {
      'posts/me': {
        data: {
          post: '2620'
        }
      }
    }
  }
};
*/

const post = build(state.data, 'post', '2620');

console.log(post.id); // -> 2620
console.log(post.text); // -> hello
console.log(post.daQuestion); // -> { id: 295, text: "hello?" }
console.log(post.liker.length); //-> 3
console.log(post.liker[0]); // -> { id: 1, name: "Alice" }

// Other examples

const post = build(state.data, 'post', '2620', { eager: true });
const post = build(state.data, 'post', '2620', { eager: false, ignoreLinks: true });
```

Child objects are lazy loaded unless eager option is explicitly provided.

# License
MIT (c) Yury Dymov
