import chai, { expect } from 'chai';
import build from '../dist/bundle';
import isEqual from 'lodash/isEqual';
import merge from 'lodash/merge';

describe('build works', () => {
  const json = {
    post: {
      "2620": {
        attributes: {
          "text": "hello",
        },
        relationships: {
          daQuestion: {
            id: "295",
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

  it('assigns id as attribute', () => {
    expect(object.id).to.be.equal(2620);
  });

  it('assigns id as integer', () => {
    expect(object.id).isNumber;
  });
});
