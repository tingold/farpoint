import base64 from 'base-64';
import config from './config.json';

const chooseType = field => {
  if (field.attribute === 'photo') return 'photo';
  switch (field.attribute_type) {
    case 'xsd:string':
      return 'string';
    case 'xsd:int':
    case 'xsd:double':
    case 'xsd:long':
      return 'number';
    case 'xsd:dateTime':
      return 'date';
    default:
      return false;
  }
};

const makeField = (field, idx) => ({
  id: idx + 1,
  type: chooseType(field),
  position: field.display_order,
  field_key: field.attribute,
  field_label: field.attribute_label ? field.attribute_label : field.attribute,
  is_required: false,
  constraints: {},
});

const makeLayer = async (wfsUrl, layerName, token) => {
  const json = await getLayer(wfsUrl, layerName, token);
  return {
    layer_key: json.name,
    Title: json.title,
    feature_type: layerName,
    bbox: json.bbox_string.split(','),
    namespace: { 'xmlns:geonode': 'http://geonode' },
    schema: {
      fields: json.attributes.map(makeField).filter(f => f.type),
    },
  };
};

export const getLayers = async (wfsUrl, token) => {
  //https://exchange.boundlessgeo.io/gs/acls
  const url = `${wfsUrl}/gs/acls`;
  const response = await fetch(url, {
    headers: {
      Authorization: 'Bearer ' + token.access_token,
    },
  });
  const json = await response.json();
  const layers = json.rw.map(async layerName => {
    return await makeLayer(wfsUrl, layerName, token);
  });
  return await Promise.all(layers);
};

export const getLayer = async (wfsUrl, layerType, token) => {
  //https://exchange.boundlessgeo.io/layers/geonode:parking_meters_732c5a4b/get
  const url = `${wfsUrl}/layers/${layerType}/get`;

  const response = await fetch(url, {
    headers: {
      Authorization: 'Bearer ' + token.access_token,
    },
  });

  const json = await response.json();
  return json;
};

export const getToken = async (wfsUrl, username, password) => {
  try {
    const url = `${wfsUrl}/o/token/`;
    const headers = {
      Accept: 'application/json, application/xml, text/plain, text/html, *.*',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + base64.encode(config.client_id + ':' + config.client_secret),
    };
    const body = {
      grant_type: 'password',
      username,
      password,
    };
    const response = await fetch(url, {
      headers,
      method: 'POST',
      body: `grant_type=${body.grant_type}&username=${body.username}&password=${body.password}`,
    });
    const json = await response.json();
    return json;
  } catch (error) {
    console.log('error', error);
    return false;
  }
};