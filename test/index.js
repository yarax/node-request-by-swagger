const schema = require('./fixtures/petstore.json');
const getRequestOptions = require('../');
const assert = require('assert');
const request = require('request');
let requestOptions;

describe('build options by endpoint', () => {
  it('body json', () => {
    const path = '/pet';
    const endpoint = schema.paths[path].post;
    const args = {
      body: {name: 'test'}
    };
    const options = {
      method: 'post',
      baseUrl: `http://${schema.host}${schema.basePath}`,
      path: path,
      args: args,
    };
    requestOptions = getRequestOptions(endpoint, options);
    assert.equal(requestOptions.url, 'http://petstore.swagger.io/v2/pet');
    assert.deepEqual(requestOptions.body, { name: 'test' });
  });

  it('test with request', (done) => {
    console.log(requestOptions);
    request(requestOptions, (err, data) => {
      done();
    });
  });

  it('get with non-empty, falsy parameter', () => {
    const path = '/pet/{petId}';
    const endpoint = schema.paths[path].post;
    const args = {
      petId: 0
    };
    const options = {
      method: 'get',
      baseUrl: `http://${schema.host}${schema.basePath}`,
      path: path,
      args: args,
    };
    requestOptions = getRequestOptions(endpoint, options);
    assert.equal(requestOptions.url, 'http://petstore.swagger.io/v2/pet/0');
  });

  it('get with empty, falsy parameter', () => {
    const path = '/pet/{petId}';
    const endpoint = schema.paths[path].post;
    const args = {
      petId: ''
    };
    const options = {
      method: 'get',
      baseUrl: `http://${schema.host}${schema.basePath}`,
      path: path,
      args: args,
    };
    try {
      requestOptions = getRequestOptions(endpoint, options);
    } catch (e) {
      assert.equal(e.message, 'No required request field petId for GET /pet/{petId}')
    }

  });

});

