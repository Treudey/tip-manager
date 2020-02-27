export const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach(val => {
    // if we have an error string set valid to false
    if (val.length > 0) valid = false;
  });
  return valid;
};