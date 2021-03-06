import { useReducer, useCallback, useRef } from 'react'
import useArrayValidation from './use-array-validation'
import makeSimpleValidator from './make-simple-validator'

export default ({ initialValues, ...rest }) =>
  Array.isArray(initialValues)
    ? useArrayValidation({ initialValues, ...rest })
    : useValidation({ initialValues, ...rest })

const useValidation = ({
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
  const [validationState, dispatch] = useReducer(
    makeValidationReducer(validate, validationOptions),
    {
      values: initialValues,
      errors: validate(initialValues, validationOptions),
    },
  )

  const [touched, setTouched] = useReducer(
    (state, fieldName) => ({
      ...state,
      [fieldName]: true,
    }),
    {},
  )

  const fieldNames = useRef(Object.keys(initialValues))

  const handleSubmit = () => {
    if (forceShowOnSubmit) {
      for (const fieldName of fieldNames.current) {
        setTouched(fieldName)
      }
    }

    for (const error of Object.values(validationState.errors)) {
      if (error) return
    }

    onSubmit && onSubmit(validationState.values, validationOptions)
  }

  const isSyntheticEvent = e => e && e.target && typeof e.target === 'object'

  const changeHandlers = useRef(
    fieldNames.current.reduce(
      (changeHandlers, fieldName) => ({
        ...changeHandlers,
        // This is safe because fieldNames.current will never change
        // eslint-disable-next-line react-hooks/rules-of-hooks
        [fieldName]: useCallback(eventOrValue => {
          const value = isSyntheticEvent(eventOrValue)
            ? eventOrValue.target.value
            : eventOrValue
          dispatch({ fieldName, value })
        }, []), // eslint-disable-line react-hooks/exhaustive-deps
      }),
      {},
    ),
  )

  const blurHandlers = useRef(
    fieldNames.current.reduce(
      (changeHandlers, fieldName) => ({
        ...changeHandlers,
        // This is safe because fieldNames.current will never change
        // eslint-disable-next-line react-hooks/rules-of-hooks
        [fieldName]: useCallback(() => {
          setTouched(fieldName)
        }, []), // eslint-disable-line react-hooks/exhaustive-deps
      }),
      {},
    ),
  )

  return {
    fields: fieldNames.current.reduce(
      (fields, fieldName) => ({
        ...fields,
        [fieldName]: {
          error: validationState.errors[fieldName],
          touched: touched[fieldName],
          value: validationState.values[fieldName],
          onChange: changeHandlers.current[fieldName],
          onBlur: blurHandlers.current[fieldName],
        },
      }),
      {},
    ),
    handleSubmit,
    isValid: !Object.values(validationState.errors).some(Boolean),
  }
}

const makeValidationReducer = (validate, validationOptions) => (
  state,
  { fieldName, value },
) => {
  const values = {
    ...state.values,
    [fieldName]: value,
  }
  const errors = validate(values, validationOptions)

  return {
    values,
    errors,
  }
}
