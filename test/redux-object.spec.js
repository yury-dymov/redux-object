import { expect } from 'chai';
import build from '../dist/bundle';
import isEqual from 'lodash/isEqual';

describe('build works', () => {
  const json = {
    post: {
      "2620": {
        id: 2620,
        attributes: {
          "text": "hello",
        },
        relationships: {
          daQuestion: {
            id: "295",
            type: "question"
          },
          missingRelationship: {
            id: "296",
            type: "question"
          },
          liker: {
            id: "1,2,3",
            type: "user"
          },
          comments: {}
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
          text: "hello?"
        }
      },
      "2": {
        attributes: {
          text: "hello?"
        }
      },
      "3": {
        attributes: {
          text: "hello?"
        }
      },
      "4": {
        attributes: {
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
  };

  

  const object = build(json, 'post', 2620);

  it('attributes', () => {
    expect(object.text).to.be.equal('hello');
  });

  it('relationship', () => {
    expect(object.daQuestion.text).to.be.equal('hello?');
  });

  it('many relationships', () => {
    expect(object.liker.length).to.be.equal(3);
  });

  it('caching works', () => {
    expect(object.daQuestion.text).to.be.equal('hello?');
    expect(object.daQuestion.text).to.be.equal('hello?');
  });

  it('works for empty relationship', () => {
    expect(isEqual(object.comments, [])).to.be.true;
  });

  it('id in target is not overwritten by merge', () => {
    expect(object.id).to.be.equal(2620);
  });

  it('assigns correct id when in attribute', () => {
    expect(object.daQuestion.id).to.be.equal('295');
  });

  it('id in attributes is not overwritten by merge', () => {
    const user = build(json, 'user', 1);

    expect(user.id).to.be.equal(1); // and not '1'
  });

  it('missing object should return null', () => {
    const user = build(json, 'user', 30);

    expect(user).to.be.equal(null);
  });

  it('missing relationship should be null', () => {
    expect(object.missingRelationship).to.be.equal(null);
  });

  it('object with no attributes still should be an object', () => {
    const user = build(json, 'user', 4);
    const target = { id: "4" };

    expect(user).to.be.eql(target);
  });
});

describe('remote lazy loading', () => {
  const source = {
    question: {
      "29": {
        attributes: {
          yday: 228,
          text: "Какие качества Вы больше всего цените в женщинах?",
          slug: "tbd",
          id: 29        
        },
        relationships: {
          movie: {
            links: {
              "self": "http://localhost:3000/api/v1/actor/1c9d234b-66c4-411e-b785-955d57db5536/relationships/movie",
              "related": "http://localhost:3000/api/v1/actor/1c9d234b-66c4-411e-b785-955d57db5536/movie"            
            }
          }
        }
      }
    }
  };

  it('should throw exception', () => {
    const question = build(source, 'question', 29);

    try {
      question.movie;
    } catch (er) {
      return expect(er.message).to.be.equal('Remote lazy loading is not implemented for redux-object. Please refer https://github.com/yury-dymov/json-api-normalizer/issues/2');
    }

    throw new Error('test failed');
  });
});
