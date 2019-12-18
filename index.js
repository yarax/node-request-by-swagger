'use strict';

const _getRef = (json, ref) => {
  const refItems = ref.split('/');
  let returnObject = json;

  refItems.forEach((refItem, index) => {
    if (index !== 0) returnObject = returnObject[refItem];
  });

  return returnObject;
};

const getRequestOptions = (json, fixture, schemaParameters) => {
  const endpoint = json.paths[fixture.path][fixture.method];

  fixture.url = fixture.url || fixture.path;
  fixture.request = fixture.request || fixture.args;

  var reqOpts = {
    headers: {}
  };

  var contentType = endpoint.consumes ? endpoint.consumes[0] : 'application/json';
  reqOpts.method = fixture.method;

  if (json.swagger) {
    reqOpts.url = `${json.schemes[0]}://${json.host}${json.basePath ? json.basePath.replace(/\/\s*$/, '') : ''}${fixture.path}`;
  } else {
    reqOpts.url = `${json.servers[0].url}${fixture.path}`;
  }

  reqOpts.headers['content-type'] = contentType;

  (endpoint.parameters || []).forEach(function (param) {
    if (param.$ref) {
      if (schemaParameters && schemaParameters.get && typeof schemaParameters.get === 'function') {
        param = schemaParameters.get(param.$ref);
      } else {
        param = _getRef(json, param.$ref);
      }
    }

    var value = fixture.request[param.name];

    if (param.required && !value && value !== '') throw new Error('No required request field ' + param.name + ' for ' + fixture.method.toUpperCase() + ' ' + fixture.url);
    if (!value && value !== '') return;

    switch (param.in) {
      case 'body':
        if (contentType === 'application/x-www-form-urlencoded') {
          reqOpts.body = reqOpts.body ? reqOpts.body + '&' + param.name + '=' + value : param.name + '=' + value;
          reqOpts.json = false;
        } else if (contentType.includes('application/json')) {
          reqOpts.body = JSON.stringify(value);
        } else {
          reqOpts.body = value;
        }
        break;
      case 'formData':
        if (!reqOpts.formData) reqOpts.formData = {
          attachments: []
        };
        reqOpts.formData.attachments.push(value);
        reqOpts.json = false;
        break;
      case 'path':
        reqOpts.url = reqOpts.url.replace('{' + param.name + '}', value);
        break;
      case 'query':
        if (!reqOpts.qs) reqOpts.qs = {};
        var newValue;
        if (Array.isArray(value)) {
          newValue = value[0];
        } else {
          newValue = value;
        }
        if (typeof newValue !== 'string' && typeof newValue !== 'number') {
          throw new Error('GET query string for non string/number values is not supported');
        }
        reqOpts.qs[param.name] = newValue;
        break;
      case 'header':
        if (!reqOpts.headers) reqOpts.headers = {};
        reqOpts.headers[param.name] = value;
        break;
      default:
        throw new Error(`Unsupported param type for param ${param.name}: ${param.in}`)
    }
  });

  return reqOpts;
}

module.exports = getRequestOptions;

