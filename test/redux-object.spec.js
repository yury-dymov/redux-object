import { expect } from 'chai';
import isEqual from 'lodash/isEqual';
import build from '../dist/bundle';

const json = {
  post: {
    "2620": {
      id: 2620,
      attributes: {
        "text": "hello",
      },
      relationships: {
        daQuestion: {
          data: {
            id: "295",
            type: "question"
          }
        },
        missingRelationship: {
          data: {
            id: "296",
            type: "question"
          }
        },
        liker: {
          data: [{
            id: "1",
            type: "user"
          }, {
            id: "2",
            type: "user"
          }, {
            id: "3",
            type: "user"
          }]
        },
        comments: {
          data: []
        },
        author: {
          data: null
        }
      }
    }
  },
  question: {
    "295": {
      attributes: {
        text: "hello?"
      },
      relationships: {
        posts: {
          data: [{
            id: "2620",
            type: "post"
          }]
        }
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
      attributes: {}
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

describe('build single object', () => {
  const local = Object.assign({}, json);
  const object = build(local, 'post', 2620);

  it('attributes', () => {
    expect(object.text).to.be.equal('hello');
  });

  it('many relationships', () => {
    expect(object.liker.length).to.be.equal(3);
  });

  it('relationship', () => {
    expect(object.liker[0].text).to.be.equal('hello?');
  });

  it('caching works', () => {
    local.question[295].attributes.text = 'Goodbye.';
    expect(object.daQuestion.text).to.be.equal('Goodbye.');
    local.question[295].attributes.text = 'See ya.';
    expect(object.daQuestion.text).to.be.equal('Goodbye.');
  });

  it('works for empty array relationship', () => {
    expect(isEqual(object.comments, [])).to.be.true;
  });

  it('works for empty relationship', () => {
    expect(isEqual(object.author, null)).to.be.true;
  });

  it('id in target is not overwritten by merge', () => {
    expect(object.id).to.be.equal(2620);
  });

  it('assigns correct id when in attribute', () => {
    expect(object.daQuestion.id).to.be.equal('295');
  });

  it('id in attributes is not overwritten by merge', () => {
    const user = build(local, 'user', 1);

    expect(user.id).to.be.equal(1); // and not '1'
  });

  it('missing object should return null', () => {
    const user = build(local, 'user', 30);

    expect(user).to.be.equal(null);
  });

  it('missing relationship should be null', () => {
    expect(object.missingRelationship).to.be.equal(null);
  });

  it('object with no attributes still should be an object', () => {
    const user = build(local, 'user', 4);
    const target = {id: "4"};

    expect(user).to.be.eql(target);
  });
});

describe('build all objects in collection', () => {
  const local = Object.assign({}, json);
  const list = build(local, 'user');

  it('returns an array', () => {
    expect(list).to.be.instanceOf(Array);
  });

  it('returns all items', () => {
    expect(list.length).to.be.equal(4);
  });

  it('includes attributes', () => {
    expect(list[0].text).to.be.equal('hello?');
  });
});

describe('build a specific list of objects in collection', () => {
  const local = Object.assign({}, json);
  const list = build(local, 'user', [2, 4]);

  it('returns an array', () => {
    expect(list).to.be.instanceOf(Array);
  });

  it('returns only selected items', () => {
    expect(list.length).to.be.equal(2);
    expect(list[0].id).to.be.equal('2');
    expect(list[1].id).to.be.equal('4');
  });

  it('includes attributes', () => {
    expect(list[0].text).to.be.equal('hello?');
  });

  it('returns a null result for requested items which are not present', () => {
    const extra = build(local, 'user', [2, 4, 5]);
    expect(extra.length).to.be.equal(3);
    expect(extra[2]).to.be.null;
  });
});

describe('local eager loading', () => {
  const local = Object.assign({}, json);
  const object = build(local, 'post', 2620, { eager: true });

  it('does not use lazy loading', () => {
    local.question[295].attributes.text = 'Goodbye.';
    expect(object.daQuestion.text).to.be.equal('hello?');
  });

  it('does not cyclically load parent items in child relationships', () => {
    expect(object.daQuestion.posts[0]).to.be.null;
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

  const sourceWithData = {
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
            data: [],
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
      return expect(er.message).not.to.be.null;
    }

    throw new Error('test failed');
  });

  it('should not throw exception', () => {
    const question = build(sourceWithData, 'question', 29);
    return expect(isEqual(question.movie, [])).to.be.true;
  });

  it('should ignore remote lazy loading links', () => {
    const question = build(sourceWithData, 'question', 29, { eager: false, ignoreLinks: true });
    return expect(isEqual(question.movie, [])).to.be.true;
  });
});
