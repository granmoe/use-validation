import { useState, useRef } from 'react'

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

  const handleSubmitRef = useRef(options => {
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

    const isValid = Object.values(errors).reduce(
      (isValid, error) => isValid && !error,
      true,
    )
    if (!isValid) return

    onSubmit && onSubmit(values, options)
  })

  return {
    fields: Object.keys(initialValues).reduce((result, fieldName) => {
      const onChangeRef = useRef(handleChange(fieldName))
      const onBlurRef = useRef(handleBlur(fieldName))

      return {
        ...result,
        [fieldName]: {
          error: errors[fieldName],
          touched: touched[fieldName],
          value: values[fieldName],
          onChange: onChangeRef.current,
          onBlur: onBlurRef.current,
        },
      }
    }, {}),
    handleSubmit: handleSubmitRef.current,
  }
}

const makeSimpleValidator = (fieldNames, message) => values =>
  fieldNames.reduce((result, fieldName) => {
    result[fieldName] = values[fieldName] === '' ? message : null
    return result
  }, {})
