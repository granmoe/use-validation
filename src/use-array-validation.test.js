import React from 'react'
import { render, fireEvent } from 'react-testing-library'
import useValidation from './index' // eslint-disable-line unicorn/import-index

const setupTest = options => {
  // eslint-disable-next-line react/prop-types
  const TestComponent = ({ mockFunc }) => {
    const { groups, handleSubmit, areAllValid } = useValidation({
      initialValues: [
        {
          foo: '',
          bar: '',
          baz: '',
        },
      ],
      ...options,
    })

    mockFunc({ groups, handleSubmit, areAllValid })

    return (
      <div>
        {groups.map(({ key, fields }) => (
          <div key={key}>
            <input
              data-testid={`foo-${key}`}
              onChange={fields.foo.onChange}
              onBlur={fields.foo.onBlur}
            />
            <input
              data-testid={`bar-${key}`}
              onChange={e => {
                fields.bar.onChange(e.target.value)
              }}
              onBlur={fields.bar.onBlur}
            />
            <input
              data-testid={`baz-${key}`}
              onChange={fields.baz.onChange}
              onBlur={fields.baz.onBlur}
            />
          </div>
        ))}
      </div>
    )
  }

  const mockFunc = jest.fn()
  const renderContext = render(<TestComponent mockFunc={mockFunc} />)

  return { mockFunc, renderContext }
}

const getLastArgs = mockObject =>
  mockObject.mock.calls[mockObject.mock.calls.length - 1][0]

const getLastArgsFirstGroup = mockObject => getLastArgs(mockObject).groups[0]

describe('use-array-validation', () => {
  const mockOnSubmit = jest.fn()
  const {
    renderContext: { getByTestId },
    mockFunc,
  } = setupTest({
    defaultErrorMessage: 'Please enter a value',
    onSubmit: mockOnSubmit,
  })

  test('fields are initialized correctly', () => {
    const { groups } = getLastArgs(mockFunc)

    groups.forEach(({ fields }) => {
      expect(fields).toEqual({
        foo: {
          value: '',
          // TODO: Maybe change normal use-validation to also init touched fields all to false?
          touched: false,
          error: 'Please enter a value',
          onChange: fields.foo.onChange,
          onBlur: fields.foo.onBlur,
        },
        bar: {
          value: '',
          touched: false,
          error: 'Please enter a value',
          onChange: fields.bar.onChange,
          onBlur: fields.bar.onBlur,
        },
        baz: {
          value: '',
          touched: false,
          error: 'Please enter a value',
          onChange: fields.baz.onChange,
          onBlur: fields.baz.onBlur,
        },
      })
    })
  })

  test('values are updated correctly when onChange is called with an event', () => {
    const { key: firstKey } = getLastArgsFirstGroup(mockFunc)

    fireEvent.change(getByTestId(`foo-${firstKey}`), {
      target: {
        value: 'foo value',
      },
    })

    const { fields } = getLastArgsFirstGroup(mockFunc)

    expect(fields.foo.value).toEqual('foo value')
    expect(fields.bar.value).toEqual('')
    expect(fields.baz.value).toEqual('')
  })

  test('values are updated correctly when onChange is called with a plain value', () => {
    const { key: firstKey } = getLastArgsFirstGroup(mockFunc)

    fireEvent.change(getByTestId(`bar-${firstKey}`), {
      target: {
        value: 'bar value',
      },
    })

    const { fields } = getLastArgsFirstGroup(mockFunc)

    expect(fields.foo.value).toEqual('foo value')
    expect(fields.bar.value).toEqual('bar value')
    expect(fields.baz.value).toEqual('')
  })

  test('errors are updated correctly when values change', () => {
    const {
      groups: [{ fields: prevFields }],
    } = mockFunc.mock.calls[mockFunc.mock.calls.length - 2][0]

    expect(prevFields.foo.error).toEqual(null)
    expect(prevFields.bar.error).toEqual('Please enter a value')
    expect(prevFields.baz.error).toEqual('Please enter a value')

    const { fields: currentFields } = getLastArgsFirstGroup(mockFunc)

    expect(currentFields.foo.error).toEqual(null)
    expect(currentFields.bar.error).toEqual(null)
    expect(currentFields.baz.error).toEqual('Please enter a value')
  })

  test('custom error message for defaultValidation is used if passed', () => {
    const { fields } = getLastArgsFirstGroup(mockFunc)
    expect(fields.baz.error).toEqual('Please enter a value')
  })

  test('default error message used if errorMessage not passed', () => {
    const { mockFunc } = setupTest()

    const { fields } = getLastArgsFirstGroup(mockFunc)

    expect(fields.foo.error).toBe(
      `Looks like that didn't work. Please try again.`,
    )
  })

  test('touched is updated correctly when field is blurred', () => {
    const { fields: fieldsBeforeBlur, key: firstKey } = getLastArgsFirstGroup(
      mockFunc,
    )

    expect(fieldsBeforeBlur.foo.touched).toBeFalsy()
    expect(fieldsBeforeBlur.bar.touched).toBeFalsy()
    expect(fieldsBeforeBlur.baz.touched).toBeFalsy()

    fireEvent.blur(getByTestId(`foo-${firstKey}`))

    const { fields: fieldsAfterBlur } = getLastArgsFirstGroup(mockFunc)

    expect(fieldsAfterBlur.foo.touched).toBeTruthy()
    expect(fieldsAfterBlur.bar.touched).toBeFalsy()
    expect(fieldsAfterBlur.baz.touched).toBeFalsy()
  })

  test('touched is set to true on all fields when handleSubmit is called when forceShowOnSubmit is omitted (defaults to true) or passed as true', () => {
    const { handleSubmit } = getLastArgs(mockFunc)
    handleSubmit()

    const { fields } = getLastArgsFirstGroup(mockFunc)

    expect(fields.foo.touched).toBeTruthy()
    expect(fields.bar.touched).toBeTruthy()
    expect(fields.baz.touched).toBeTruthy()
  })

  test('touched is NOT changed on any fields when handleSubmit is called if forceShowOnSubmit is passed as true', () => {
    const { mockFunc } = setupTest({ forceShowOnSubmit: false })
    const { handleSubmit } = getLastArgs(mockFunc)
    handleSubmit()

    const { fields } = getLastArgsFirstGroup(mockFunc)

    expect(fields.foo.touched).toBeFalsy()
    expect(fields.bar.touched).toBeFalsy()
    expect(fields.baz.touched).toBeFalsy()
  })

  test('handleSubmit does not call onSubmit when one or more fields are invalid', () => {
    const { handleSubmit } = getLastArgs(mockFunc)
    handleSubmit()

    expect(mockOnSubmit.mock.calls.length).toBe(0)
  })

  test('isValid is false if there are any errors', () => {
    const { isValid } = getLastArgsFirstGroup(mockFunc)
    expect(isValid).toBe(false)
  })

  test('handleSubmit calls onSubmit when all fields are valid', () => {
    const { key: firstKey } = getLastArgsFirstGroup(mockFunc)

    fireEvent.change(getByTestId(`baz-${firstKey}`), {
      target: {
        value: 'baz value',
      },
    })

    const { handleSubmit } = getLastArgs(mockFunc)
    handleSubmit()

    expect(mockOnSubmit.mock.calls.length).toBe(1)
  })

  test('isValid is true if there are no errors', () => {
    const { isValid } = getLastArgsFirstGroup(mockFunc)
    expect(isValid).toBe(true)
  })

  test('handleChange and handleBlur references persist across renders', () => {
    const { mockFunc } = setupTest()
    const { key: firstKey, fields: firstFields } = getLastArgsFirstGroup(
      mockFunc,
    )

    fireEvent.change(getByTestId(`foo-${firstKey}`), {
      e: { target: { value: 'asdf' } },
    })

    fireEvent.change(getByTestId(`bar-${firstKey}`), {
      e: { target: { value: 'asdf' } },
    })

    fireEvent.change(getByTestId(`baz-${firstKey}`), {
      e: { target: { value: 'asdf' } },
    })

    const { fields: currentFields } = getLastArgsFirstGroup(mockFunc)

    expect(firstFields.foo.onChange).toEqual(currentFields.foo.onChange)
    expect(firstFields.foo.onBlur).toEqual(currentFields.foo.onBlur)
    expect(firstFields.bar.onChange).toEqual(currentFields.bar.onChange)
    expect(firstFields.bar.onBlur).toEqual(currentFields.bar.onBlur)
    expect(firstFields.baz.onChange).toEqual(currentFields.baz.onChange)
    expect(firstFields.baz.onBlur).toEqual(currentFields.baz.onBlur)
  })

  test('handleSubmit reference is not persisted across renders', () => {
    const { handleSubmit: prevHandleSubmit } = mockFunc.mock.calls[
      mockFunc.mock.calls.length - 2
    ][0]

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
  handleSubmit()

  expect(getLastArgs(onSubmitMock)).toEqual(
    [
      {
        foo: '',
        bar: '',
        baz: '',
      },
    ],
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

// TODO: Tests for areAllValid, add, remove
// add and remove should be same references across renders
