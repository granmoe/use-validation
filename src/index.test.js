import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, fireEvent } from '@testing-library/react'
import useValidation from './index' // eslint-disable-line unicorn/import-index

const setupTest = (
  options = {
    onSubmit: jest.fn(),
  },
) => {
  // eslint-disable-next-line react/prop-types
  const TestComponent = ({ mockFunc }) => {
    const { fields, handleSubmit, isValid } = useValidation({
      initialValues: {
        foo: '',
        bar: '',
        baz: '',
      },
      ...options,
    })

    mockFunc({ fields, handleSubmit, isValid })

    return (
      <div>
        <input
          data-testid="foo"
          onChange={fields.foo.onChange}
          onBlur={fields.foo.onBlur}
        />
        <input
          data-testid="bar"
          onChange={e => {
            fields.bar.onChange(e.target.value)
          }}
          onBlur={fields.bar.onBlur}
        />
        <input
          data-testid="baz"
          onChange={e => {
            fields.baz.onChange(e.target.value)
          }}
          onBlur={fields.baz.onBlur}
        />
      </div>
    )
  }

  const mockFunc = jest.fn()
  const renderContext = render(<TestComponent mockFunc={mockFunc} />)

  return { mockFunc, renderContext }
}

const getLastArgs = mockObject =>
  mockObject.mock.calls[mockObject.mock.calls.length - 1][0]

describe('use-validation', () => {
  test('fields are initialized correctly', () => {
    const { mockFunc } = setupTest({
      defaultErrorMessage: 'Please enter a value',
    })

    const { fields } = getLastArgs(mockFunc)

    expect(fields).toEqual({
      foo: {
        value: '',
        touched: undefined,
        error: 'Please enter a value',
        onChange: fields.foo.onChange,
        onBlur: fields.foo.onBlur,
      },
      bar: {
        value: '',
        touched: undefined,
        error: 'Please enter a value',
        onChange: fields.bar.onChange,
        onBlur: fields.bar.onBlur,
      },
      baz: {
        value: '',
        touched: undefined,
        error: 'Please enter a value',
        onChange: fields.baz.onChange,
        onBlur: fields.baz.onBlur,
      },
    })
  })

  test('values are updated correctly when onChange is called with an event', () => {
    const {
      mockFunc,
      renderContext: { getByTestId },
    } = setupTest({
      defaultErrorMessage: 'Please enter a value',
    })

    fireEvent.change(getByTestId('foo'), {
      target: {
        value: 'foo value',
      },
    })

    const { fields } = getLastArgs(mockFunc)

    expect(fields.foo.value).toEqual('foo value')
    expect(fields.bar.value).toEqual('')
    expect(fields.baz.value).toEqual('')
  })

  test('values are updated correctly when onChange is called with a plain value', () => {
    const {
      mockFunc,
      renderContext: { getByTestId },
    } = setupTest({
      defaultErrorMessage: 'Please enter a value',
    })

    fireEvent.change(getByTestId('baz'), {
      target: {
        value: 'baz value',
      },
    })

    const { fields } = getLastArgs(mockFunc)

    expect(fields.foo.value).toEqual('')
    expect(fields.bar.value).toEqual('')
    // Baz input calls fields.baz.onChange with e.target.value
    expect(fields.baz.value).toEqual('baz value')
  })

  test('custom error message for defaultValidation is used if passed', () => {
    const { mockFunc } = setupTest({
      defaultErrorMessage: 'Please enter a value',
    })

    const { fields } = getLastArgs(mockFunc)
    expect(fields.foo.error).toEqual('Please enter a value')
  })

  test('default error message used if errorMessage not passed', () => {
    const { mockFunc } = setupTest()
    const { fields } = getLastArgs(mockFunc)
    expect(fields.foo.error).toBe(
      `Looks like that didn't work. Please try again.`,
    )
  })

  test('errors are updated correctly when values change', () => {
    const {
      mockFunc,
      renderContext: { getByTestId },
    } = setupTest({
      defaultErrorMessage: 'Please enter a value',
    })

    const { fields: prevFields } = getLastArgs(mockFunc)

    expect(prevFields.foo.error).toEqual('Please enter a value')
    expect(prevFields.bar.error).toEqual('Please enter a value')
    expect(prevFields.baz.error).toEqual('Please enter a value')

    fireEvent.change(getByTestId('foo'), {
      target: {
        value: 'foo value',
      },
    })

    fireEvent.change(getByTestId('bar'), {
      target: {
        value: 'bar value',
      },
    })

    const { fields: currentFields } = getLastArgs(mockFunc)

    expect(currentFields.foo.error).toEqual(null)
    expect(currentFields.bar.error).toEqual(null)
    expect(currentFields.baz.error).toEqual('Please enter a value')
  })

  test('touched is updated correctly when field is blurred', () => {
    const {
      mockFunc,
      renderContext: { getByTestId },
    } = setupTest({
      defaultErrorMessage: 'Please enter a value',
    })

    const { fields: fieldsBeforeBlur } = getLastArgs(mockFunc)

    expect(fieldsBeforeBlur.foo.touched).toBeFalsy()
    expect(fieldsBeforeBlur.bar.touched).toBeFalsy()
    expect(fieldsBeforeBlur.baz.touched).toBeFalsy()

    fireEvent.blur(getByTestId('foo'))

    const { fields: fieldsAfterBlur } = getLastArgs(mockFunc)

    expect(fieldsAfterBlur.foo.touched).toBeTruthy()
    expect(fieldsAfterBlur.bar.touched).toBeFalsy()
    expect(fieldsAfterBlur.baz.touched).toBeFalsy()
  })

  test('touched is set to true on all fields when handleSubmit is called when forceShowOnSubmit is omitted (defaults to true) or passed as true', () => {
    const { mockFunc } = setupTest({
      defaultErrorMessage: 'Please enter a value',
    })

    const { handleSubmit } = getLastArgs(mockFunc)
    act(() => {
      handleSubmit()
    })

    const { fields } = getLastArgs(mockFunc)

    expect(fields.foo.touched).toBeTruthy()
    expect(fields.bar.touched).toBeTruthy()
    expect(fields.baz.touched).toBeTruthy()
  })

  test('touched is NOT changed on any fields when handleSubmit is called if forceShowOnSubmit is passed as false', () => {
    const { mockFunc } = setupTest({
      defaultErrorMessage: 'Please enter a value',
      forceShowOnSubmit: false,
    })

    const { fields, handleSubmit } = getLastArgs(mockFunc)
    act(() => {
      handleSubmit()
    })

    expect(fields.foo.touched).toBeFalsy()
    expect(fields.bar.touched).toBeFalsy()
    expect(fields.baz.touched).toBeFalsy()
  })

  test('handleSubmit does not call onSubmit when one or more fields are invalid', () => {
    const mockOnSubmit = jest.fn()
    const { mockFunc } = setupTest({
      defaultErrorMessage: 'Please enter a value',
      forceShowOnSubmit: false,
      onSubmit: mockOnSubmit,
    })

    const { handleSubmit } = getLastArgs(mockFunc)
    act(() => {
      handleSubmit()
    })

    expect(mockOnSubmit.mock.calls.length).toBe(0)
  })

  test('isValid is false if there are any errors', () => {
    const { mockFunc } = setupTest({
      defaultErrorMessage: 'Please enter a value',
    })

    const { isValid } = getLastArgs(mockFunc)
    expect(isValid).toBe(false)
  })

  test('handleSubmit calls onSubmit when all fields are valid', () => {
    const mockOnSubmit = jest.fn()
    const {
      mockFunc,
      renderContext: { getByTestId },
    } = setupTest({
      defaultErrorMessage: 'Please enter a value',
      forceShowOnSubmit: false,
      onSubmit: mockOnSubmit,
    })

    fireEvent.change(getByTestId('foo'), {
      target: {
        value: 'foo value',
      },
    })

    fireEvent.change(getByTestId('bar'), {
      target: {
        value: 'bar value',
      },
    })

    fireEvent.change(getByTestId('baz'), {
      target: {
        value: 'baz value',
      },
    })

    const { handleSubmit } = getLastArgs(mockFunc)
    act(() => {
      handleSubmit()
    })

    expect(mockOnSubmit.mock.calls.length).toBe(1)
  })

  test('isValid is true if there are no errors', () => {
    const {
      mockFunc,
      renderContext: { getByTestId },
    } = setupTest({
      defaultErrorMessage: 'Please enter a value',
    })

    fireEvent.change(getByTestId('foo'), {
      target: {
        value: 'foo value',
      },
    })

    fireEvent.change(getByTestId('bar'), {
      target: {
        value: 'bar value',
      },
    })

    fireEvent.change(getByTestId('baz'), {
      target: {
        value: 'baz value',
      },
    })

    const { isValid } = getLastArgs(mockFunc)
    expect(isValid).toBe(true)
  })

  test('handleChange and handleBlur references persist across renders', () => {
    const {
      mockFunc,
      renderContext: { getByTestId },
    } = setupTest({
      defaultErrorMessage: 'Please enter a value',
    })

    const { fields: prevFields } = getLastArgs(mockFunc)

    fireEvent.change(getByTestId('foo'), {
      target: {
        value: 'foo value',
      },
    })

    fireEvent.change(getByTestId('bar'), {
      target: {
        value: 'bar value',
      },
    })

    fireEvent.change(getByTestId('baz'), {
      target: {
        value: 'baz value',
      },
    })

    const { fields: currentFields } = getLastArgs(mockFunc)

    expect(currentFields.foo.onChange).toEqual(prevFields.foo.onChange)
    expect(currentFields.foo.onBlur).toEqual(prevFields.foo.onBlur)
    expect(currentFields.bar.onChange).toEqual(prevFields.bar.onChange)
    expect(currentFields.bar.onBlur).toEqual(prevFields.bar.onBlur)
    expect(currentFields.baz.onChange).toEqual(prevFields.baz.onChange)
    expect(currentFields.baz.onBlur).toEqual(prevFields.baz.onBlur)
  })

  test('handleSubmit reference is not persisted across renders', () => {
    const {
      mockFunc,
      renderContext: { getByTestId },
    } = setupTest({
      defaultErrorMessage: 'Please enter a value',
    })

    const { handleSubmit: prevHandleSubmit } = getLastArgs(mockFunc)

    fireEvent.change(getByTestId('baz'), {
      target: {
        value: 'baz value',
      },
    })

    const { handleSubmit } = getLastArgs(mockFunc)

    expect(handleSubmit).not.toEqual(prevHandleSubmit)
  })
})

test('validationOptions are passed to validate and onSubmit', () => {
  const onSubmitMock = jest.fn()
  const validateMock = jest.fn(() => ({}))

  const { mockFunc } = setupTest({
    validationOptions: 123,
    onSubmit: onSubmitMock,
    validate: validateMock,
  })

  const { handleSubmit } = getLastArgs(mockFunc)
  act(() => {
    handleSubmit()
  })

  expect(getLastArgs(onSubmitMock)).toEqual(
    {
      foo: '',
      bar: '',
      baz: '',
    },
    123,
  )
  expect(getLastArgs(validateMock)).toEqual(
    {
      foo: '',
      bar: '',
      baz: '',
    },
    123,
  )
})
