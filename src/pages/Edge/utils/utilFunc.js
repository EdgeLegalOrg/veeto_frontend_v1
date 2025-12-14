import moment from "moment";

// Date format
export const formatDateFunc = (date, format) => {
  format = format || "DD-MM-YYYY";

  if (!date) {
    return null;
  }
  // return moment(date).format('YYYY-MM-DD');
  return moment(date).format(format);
};

export const convertSubstring = (word, limit = 15) => {
  if (word) {
    if (word?.length > limit) {
      return `${word.substring(0, limit)}...`;
    } else {
      return word;
    }
  }
  return "";
};

export const findDisplayname = (from = [], val = "") => {
  if (val) {
    let data = from.find((d) => d.value === val);
    return data ? data.display : "";
  }
  return "";
};

export const roundToDigit = (num, precision = 2) => {
  num = num ? parseFloat(num) : 0;
  return num.toFixed(precision);
};

export const getQuery = () => {
  let query = {};
  let search = window.location.search;
  search = search?.split("?");
  if (search.length > 1) {
    search = search[1];
    search = search?.split("&");

    for (let i in search) {
      let item = search[i].split("=");
      query[item[0]] = item[1];
    }
  }

  return query;
};

export const removeAllStorage = () => {
  let allStorage = window.localStorage;

  for (let a in allStorage) {
    window.localStorage.removeItem(a);
  }
  // window.localStorage.removeItem('metaData');
  // window.localStorage.removeItem('roleList');
  // window.localStorage.removeItem('rightList');
  // window.localStorage.removeItem('countryList');
  // window.localStorage.removeItem('postalList');
  // window.localStorage.removeItem('userDetails');
  // window.localStorage.removeItem('enumList');
  // window.localStorage.removeItem('matterTabs');
  // window.localStorage.removeItem('matterTypeList');
  // window.localStorage.removeItem('matterContactRole');
  // window.localStorage.removeItem('matterStatus');
};

export const formatCurrency = (amount) => {
  if (isNaN(amount)) {
    return "";
  }
  // Ensure it's a number and format the number with commas
  return "$" + roundToDigit(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const checkHasPermission = (key) => {
  const userDetails = JSON.parse(window.localStorage.getItem("userDetails"));

  const authorities = userDetails.authorities;

  if (authorities.length) {
    return authorities.includes(key);
  }

  return false;
};
