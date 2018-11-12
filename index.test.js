import React from 'react'
import { render, fireEvent } from 'react-testing-library'
import useValidation from '.'

const setupTest = options => {
  // eslint-disable-next-line react/prop-types
  const Test = ({ mockFunc }) => {
    const { fields, handleSubmit } = useValidation({
      initialValues: {
        foo: '',
        bar: '',
        baz: '',
      },
      ...options,
    })

    mockFunc({ fields, handleSubmit })

    return (
      <React.Fragment>
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
          onChange={fields.baz.onChange}
          onBlur={fields.baz.onBlur}
        />
      </React.Fragment>
    )
  }

  const mockFunc = jest.fn()
  const renderContext = render(<Test mockFunc={mockFunc} />)

  return { mockFunc, renderContext }
}

describe('use-validation', () => {
  const {
    renderContext: { getByTestId },
    mockFunc,
  } = setupTest({ defaultErrorMessage: 'Please enter a value' })

  let lastMockCall = 0 // More convenient than doing mockFunc.mock.calls.length everywhere
  test('fields are initialized correctly', () => {
    const [{ fields }] = mockFunc.mock.calls[0]

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
    fireEvent.change(getByTestId('foo'), {
      target: {
        value: 'foo value',
      },
    })
    lastMockCall++

    expect(mockFunc.mock.calls[lastMockCall][0].fields.foo.value).toEqual(
      'foo value',
    )
  })

  test('values are updated correctly when onChange is called with a plain value', () => {
    fireEvent.change(getByTestId('bar'), {
      target: {
        value: 'bar value',
      },
    })
    lastMockCall++

    expect(mockFunc.mock.calls[lastMockCall][0].fields.bar.value).toEqual(
      'bar value',
    )
  })

  test('errors are updated correctly when values change', () => {
    expect(mockFunc.mock.calls[lastMockCall - 1][0].fields.foo.error).toEqual(
      null,
    )
    expect(mockFunc.mock.calls[lastMockCall - 1][0].fields.bar.error).toEqual(
      'Please enter a value',
    )
    expect(mockFunc.mock.calls[lastMockCall][0].fields.bar.error).toEqual(null)
  })

  test('touched is updated correctly when field is blurred', () => {
    const fieldsBeforeBlur = mockFunc.mock.calls[lastMockCall][0].fields
    expect(fieldsBeforeBlur.foo.touched).toBeFalsy()
    expect(fieldsBeforeBlur.bar.touched).toBeFalsy()
    expect(fieldsBeforeBlur.baz.touched).toBeFalsy()

    fireEvent.blur(getByTestId('foo'))
    lastMockCall++
    const fieldsAfterBlur = mockFunc.mock.calls[lastMockCall][0].fields

    expect(fieldsAfterBlur.foo.touched).toBeTruthy()
    expect(fieldsAfterBlur.bar.touched).toBeFalsy()
    expect(fieldsAfterBlur.baz.touched).toBeFalsy()
  })

  test('touched is set to true on all fields when handleSubmit is called', () => {
    mockFunc.mock.calls[lastMockCall][0].handleSubmit()
    lastMockCall++

    expect(mockFunc.mock.calls[lastMockCall][0].fields.foo.touched).toBeTruthy()
    expect(mockFunc.mock.calls[lastMockCall][0].fields.bar.touched).toBeTruthy()
    expect(mockFunc.mock.calls[lastMockCall][0].fields.baz.touched).toBeTruthy()
  })

  test('same reference is used for handleSubmit function across renders', () => {
    expect(mockFunc.mock.calls[0][0].handleSubmit).toBe(
      mockFunc.mock.calls[1][0].handleSubmit,
    )
  })

  test('same reference is used for field functions across renders', () => {
    expect(mockFunc.mock.calls[0][0].fields.foo.onChange).toBe(
      mockFunc.mock.calls[1][0].fields.foo.onChange,
    )
    expect(mockFunc.mock.calls[0][0].fields.foo.onBlur).toBe(
      mockFunc.mock.calls[1][0].fields.foo.onBlur,
    )
  })
})

/* Blah
  export default ({
    fields,
    defaultErrorMessage = `Looks like that didn't work. Please try again.`,
    validate = makeSimpleValidator(Object.keys(fields), defaultErrorMessage),
    forceShowOnSubmit = true,
    validationOptions,
    onSubmit,
  }) => {
*/

/* To Do
defaultErrorMessage + default validate
custom validate
forceShowOnSubmit true
forceShowOnSubmit false
validationOptions
onSubmit

maybe move this file inline with index in parent dir
*/
