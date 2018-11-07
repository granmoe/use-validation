export default (fieldNames, message) => values =>
	fieldNames.reduce((result, fieldName) => {
		result[fieldName] = values[fieldName] === '' ? message : null
		return result
	}, {})
