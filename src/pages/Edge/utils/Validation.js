export const getRequiredFields = (tableName) => {
  let req = [];
  let display = {};
  let data = JSON.parse(window.localStorage.getItem('metaData'));
  if (data && data[tableName]) {
    let fields = data[tableName].fields;

    fields.forEach((field) => {
      if (field.mandatory) {
        req.push(field.fieldName);
        display = { ...display, [field.fieldName]: field.displayName };
      }
    });
  }

  return {
    requiredFields: req,
    displayNames: display,
  };
};

export const validate = (obj, tableName, skipFields = []) => {
  let notValid = [];
  let { requiredFields, displayNames } = getRequiredFields(tableName);
  for (let a in obj) {
    if (requiredFields.includes(a)) {
      if (!obj[a] && !skipFields.includes(a)) {
        notValid.push(displayNames[a]);
        break;
      }
    }
  }

  return notValid?.length > 0 ? notValid?.join(', ') : false;
};
