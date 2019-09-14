import { useReducer, useCallback, useRef } from 'react'
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
  const prevKeys = useRef()
  prevKeys.current = keys.current
  keys.current = validationState.map(({ key }) => key)

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

  const add = useCallback(() => {
    dispatch({ type: 'add' })
  }, [dispatch])

  const createEventHandlers = keys =>
    keys.reduce(
      (groupsByKey, key) => ({
        ...groupsByKey,
        [key]: fieldNames.current.reduce(
          (eventHandlers, fieldName) => ({
            ...eventHandlers,
            [fieldName]: {
              onChange: eventOrValue => {
                const value = isSyntheticEvent(eventOrValue)
                  ? eventOrValue.target.value
                  : eventOrValue
                dispatch({ type: 'change', key, fieldName, value })
              },
              onBlur: () => {
                dispatch({ type: 'blur', key, fieldName })
              },
            },
          }),
          {},
        ),
      }),
      {},
    )

  const createRemoveFuncs = keys =>
    keys.reduce(
      (removeFuncsByKey, key) => ({
        ...removeFuncsByKey,
        [key]: () => {
          dispatch({ type: 'remove', key })
        },
      }),
      {},
    )

  const removeFuncs = useRef(createRemoveFuncs(keys.current))
  const eventHandlers = useRef(createEventHandlers(keys.current))
  if (prevKeys.current && prevKeys.current.length !== keys.current.length) {
    eventHandlers.current = createEventHandlers(keys.current)
    removeFuncs.current = createRemoveFuncs(keys.current)
  }

  return {
    add,
    groups: validationState.map(group => ({
      remove: removeFuncs.current[group.key],
      key: group.key,
      isValid: group.isValid,
      fields: fieldNames.current.reduce(
        (fields, fieldName) => ({
          ...fields,
          [fieldName]: {
            error: group.errors[fieldName],
            touched: group.touched[fieldName],
            value: group.values[fieldName],
            ...eventHandlers.current[group.key][fieldName],
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
      : [...state.slice(0, index), updatedGroup, ...state.slice(index + 1)]
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
      ? [updatedGroup, ...state.slice(1)]
      : [...state.slice(0, index), updatedGroup, ...state.slice(index + 1)]
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
      // Use values of first group from initial values for our copy
      initFormFields(initialValues[0], {
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

    const index = state.findIndex(group => group.key === key)

    return index === 0
      ? state.slice(1)
      : [...state.slice(0, index), ...state.slice(index + 1)]
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
