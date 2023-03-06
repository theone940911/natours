export default (obj, ...fields) => {
  const objCopy = { ...obj };
  Object.keys(objCopy).forEach((key) => {
    if (!fields.includes(key)) delete objCopy[`${key}`];
  });
  return objCopy;
};
