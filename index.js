import { useState } from 'react'

export default ({
  initialValues,
  defaultErrorMessage = `Looks like that didn't work. Please try again.`,
  validate = makeSimpleValidator(
    Object.keys(initialValues),
    defaultErrorMessage,
  ),
  forceShowOnSubmit = true,
  validationOptions,
  onSubmit,
}) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState(
    validate(initialValues, validationOptions),
  )
  const [touched, setTouched] = useState({})

  const handleChange = fieldName => eventOrValue => {
    const isSyntheticEvent = e => e && e.target && typeof e.target === 'object'
    const newValues = {
      ...values,
      [fieldName]: isSyntheticEvent(eventOrValue)
        ? eventOrValue.target.value
        : eventOrValue,
    }
    setValues(newValues)
    setErrors(validate(newValues, validationOptions))
  }

  const handleBlur = fieldName => () => {
    setTouched({
      ...touched,
      [fieldName]: true,
    })
  }

  const handleSubmit = () => {
    if (forceShowOnSubmit) {
      setTouched(
        Object.keys(initialValues).reduce(
          (touched, fieldName) => ({
            ...touched,
            [fieldName]: true,
          }),
          {},
        ),
      )
    }

    for (const error of Object.values(errors)) {
      if (error) return
    }

    onSubmit && onSubmit(values, validationOptions)
  }

  return {
    fields: Object.keys(initialValues).reduce(
      (fields, fieldName) => ({
        ...fields,
        [fieldName]: {
          error: errors[fieldName],
          touched: touched[fieldName],
          value: values[fieldName],
          onChange: handleChange(fieldName),
          onBlur: handleBlur(fieldName),
        },
      }),
      {},
    ),
    handleSubmit,
  }
}

const makeSimpleValidator = (fieldNames, message) => values =>
  fieldNames.reduce((errors, fieldName) => {
    errors[fieldName] = values[fieldName] === '' ? message : null
    return errors
  }, {})
