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
            },{
              id: "2",
              type: "user"
            },{
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
