export default (fieldNames, message) => values =>
  fieldNames.reduce((errors, fieldName) => {
    errors[fieldName] = values[fieldName] === '' ? message : null
    return errors
  }, {})
