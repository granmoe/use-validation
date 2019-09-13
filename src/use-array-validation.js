import { useReducer, useCallback, useRef, useMemo } from 'react'
import makeSimpleValidator from './make-simple-validator'

export default ({
  initialValues,
  defaultErrorMessage = `Looks like that didn't work. Please try again.`,
  validate = makeSimpleValidator(
    Object.keys(initialValues[0]),
    defaultErrorMessage,
  ),
  forceShowOnSubmit = true,
  validationOptions,
  onSubmit,
}) => {
  const fieldNames = useRef(Object.keys(initialValues[0]))

  const [validationState, dispatch] = useReducer(
    makeValidationReducer(initialValues, {
      validate,
      validationOptions,
      fieldNames,
    }),
    initialValues.map(values =>
      initFormFields(values, { validate, validationOptions, fieldNames }),
    ),
  )

  const keys = useRef()
  keys.current = validationState.map(({ key }) => key)
  const keysString = keys.current.toString()

  const areAllValid = validationState.every(({ isValid }) => isValid)

  const handleSubmit = () => {
    if (forceShowOnSubmit) {
      dispatch({ type: 'blur-all' })
    }

    if (!areAllValid) return

    onSubmit &&
      onSubmit(validationState.map(group => group.values), validationOptions)
  }

  const isSyntheticEvent = e => e && e.target && typeof e.target === 'object'

  const changeHandlersByKey = useMemo(
    () =>
      keys.current.reduce(
        (changeHandlersByKey, key) => ({
          [key]: fieldNames.current.reduce(
            (changeHandlers, fieldName) => ({
              ...changeHandlers,
              [fieldName]: useCallback(eventOrValue => {
                const value = isSyntheticEvent(eventOrValue)
                  ? eventOrValue.target.value
                  : eventOrValue
                dispatch({ type: 'change', key, fieldName, value })
              }),
            }),
            {},
          ),
        }),
        {},
      ),
    [keysString],
  )

  const blurHandlersByKey = useMemo(
    () =>
      keys.current.reduce(
        (blurHandlersByKey, key) => ({
          ...blurHandlersByKey,
          [key]: fieldNames.current.reduce(
            (blurHandlers, fieldName) => ({
              ...blurHandlers,
              [fieldName]: useCallback(() => {
                dispatch({ type: 'blur', key, fieldName })
              }),
            }),
            {},
          ),
        }),
        {},
      ),
    [keysString],
  )

  return {
    groups: validationState.map(group => ({
      key: group.key,
      isValid: group.isValid,
      fields: fieldNames.current.reduce(
        (fields, fieldName) => ({
          ...fields,
          [fieldName]: {
            error: group.errors[fieldName],
            touched: group.touched[fieldName],
            value: group.values[fieldName],
            onChange: changeHandlersByKey[group.key][fieldName],
            onBlur: blurHandlersByKey[group.key][fieldName],
          },
        }),
        {},
      ),
    })),
    areAllValid,
    handleSubmit,
  }
}

const makeValidationReducer = (
  initialValues,
  { validate, validationOptions, fieldNames },
) => (state, { type, key, fieldName, value }) => {
  if (type === 'change') {
    const group = state.find(group => group.key === key)
    const updatedGroup = {
      ...group,
      values: {
        ...group.values,
        [fieldName]: value,
      },
    }

    updatedGroup.errors = validate(updatedGroup.values, validationOptions)
    updatedGroup.isValid = !Object.values(updatedGroup.errors).some(Boolean)

    if (state.length === 1) {
      return [updatedGroup]
    }

    const index = state.findIndex(group => group.key === key)
    return index === 0
      ? [updatedGroup, ...state.slice(1)]
      : [...state.slice(0, index), updatedGroup, state.slice(index + 1)]
  }

  if (type === 'blur') {
    const group = state.find(group => group.key === key)
    const updatedGroup = {
      ...group,
      touched: {
        ...group.touched,
        [fieldName]: true,
      },
    }

    if (state.length === 1) {
      return [updatedGroup]
    }

    const index = state.findIndex(group => group.key === key)
    return index === 0
      ? [updatedGroup, state.slice(1)]
      : [state.slice(0, index), updatedGroup, state.slice(index + 1)]
  }

  if (type === 'blur-all') {
    return state.map(group => ({
      ...group,
      touched: fieldNames.current.reduce(
        (touched, fieldName) => ({
          ...touched,
          [fieldName]: true,
        }),
        {},
      ),
    }))
  }

  if (type === 'add') {
    return [
      ...state,
      initFormFields(initialValues, {
        validate,
        validationOptions,
        fieldNames,
      }),
    ]
  }

  if (type === 'remove') {
    if (state.length === 0) {
      return state
    }

    // TODO: Does everything still work if there are no groups?
    // Make return [{}] so callers don't blow up?
    const index = state.findIndex(group => group.key === key)

    return index === 0
      ? state.slice(1)
      : [...state.slice(0, index), state.slice(index + 1)]
  }

  throw new Error(`Unknown type: ${type}`)
}

let nextKey = 0
const initFormFields = (
  values,
  { validate, validationOptions, fieldNames },
) => {
  const errors = validate(values, validationOptions)
  const isValid = !Object.values(errors).some(Boolean)
  const key = nextKey
  nextKey++

  return {
    key,
    values,
    errors,
    isValid,
    touched: fieldNames.current.reduce(
      (touched, fieldName) => ({
        ...touched,
        [fieldName]: false,
      }),
      {},
    ),
  }
}
