const merge = require('deepmerge');

const getValue = (arg, map, fallback) => {
  let rval = false;

  if (arg && (map || map === '')) {
    let sMap = `${map}`.split('.');
    rval = arg;

    for (let a in sMap) {
      const key = sMap[a];
      if (rval[key] || rval[key] === 0) {
        rval = rval[key];
      } else {
        rval = false;
        break;
      }
    }
  }
  if (typeof fallback != 'undefined') {
    if (!rval) {
      return fallback;
    }
  }

  return rval;
};

const cm = (t, s, o) => {
  return s;
};

const mergeObj = (o, o2) => {
  return merge(o, o2, { arrayMerge: cm });
};

const setKey = (arg, map, value, valMap, skipCheck) => {
  let temp = {};
  let rval = {};
  let rvalue = arg ? arg : {};

  if (valMap) {
    value = getValue(value, valMap, false);
  }

  if (map && (skipCheck || value || value === '' || value === 0)) {
    let sMap = map.split('.');
    let len = sMap?.length;

    for (let i = 0; i < len; i++) {
      let ele = sMap[i];
      if (i === len - 1) {
        temp[i] = value;
      } else {
        temp[i] = rvalue[ele] ? rvalue[ele] : {};
      }
    }

    for (let i = len; i > 0; i--) {
      let c = i - 1;
      if (i === len) {
        rval[sMap[c]] = temp[c];
      } else {
        rval[sMap[c]] = {};
        rval[sMap[c]][sMap[c + 1]] = rval[sMap[c + 1]];
        delete rval[sMap[c + 1]];
      }
    }
  }

  return mergeObj(rvalue, rval);
};

export const get = (arg, map, fallback) => {
  return getValue(arg, map, fallback);
};

export const set = (arg, map, value, valMap, skipCheck) => {
  return setKey(arg, map, value, valMap, skipCheck);
};
