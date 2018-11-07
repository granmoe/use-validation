import { useState } from 'react'
import makeSimpleValidator from './make-simple-validator'

export default ({
  fields,
  validate,
  validationOptions,
  onSubmit,
  defaultErrorMessage,
  forceShowOnSubmit = true,
}) => {
  const validateFunc =
    validate || makeSimpleValidator(Object.keys(fields), defaultErrorMessage)

  const initialErrors = validateFunc(fields, validationOptions)

  const [values, setValues] = useState(fields)
  const [errors, setErrors] = useState(initialErrors)
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
    setErrors(validateFunc(newValues, validationOptions))
  }

  const handleBlur = fieldName => () => {
    setTouched({
      ...touched,
      [fieldName]: true,
    })
  }

  const handleSubmit = options => {
    if (forceShowOnSubmit) {
      // Set touched to true for all fields
      setTouched(
        Object.keys(fields).reduce(
          (touched, fieldName) => ({
            ...touched,
            [fieldName]: true,
          }),
          {},
        ),
      )
    }

    const isValid = Object.values(errors).reduce(
      (isValid, error) => isValid && !error,
      true,
    )
    if (!isValid) return

    onSubmit(values, options)
  }

  return {
    fields: Object.keys(fields).reduce(
      (result, fieldName) => ({
        ...result,
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
