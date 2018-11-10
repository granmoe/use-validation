import React from 'react'
import { render, fireEvent } from 'react-testing-library'
import useValidation from '../index' // eslint-disable-line unicorn/import-index
// 👆 for some reason, using '..' seems to result in a stale version of this file

describe('use-validation', () => {
  const Test = ({ mockFunc, handleSubmit }) => {
    const { fields } = useValidation({
      fields: {
        foo: '',
        bar: '',
      },
      defaultErrorMessage: `Please enter a value`,
    })

    mockFunc({ fields, handleSubmit })

    return (
      <React.Fragment>
        <input {...fields.foo} data-testid="foo" />
        <input
          {...fields.bar}
          data-testid="bar"
          onChange={e => {
            fields.bar.onChange(e.target.value)
          }}
        />
      </React.Fragment>
    )
  }

  const mockFunc = jest.fn()
  const { getByTestId } = render(<Test mockFunc={mockFunc} />)

  const [{ fields }] = mockFunc.mock.calls[0]
  const fooFuncs = {
    onChange: fields.foo.onChange,
    onBlur: fields.foo.onBlur,
  }
  const barFuncs = {
    onChange: fields.bar.onChange,
    onBlur: fields.bar.onBlur,
  }

  test('fields are initialized correctly', () => {
    expect(mockFunc.mock.calls[0][0].fields).toEqual({
      foo: {
        value: '',
        touched: undefined,
        error: 'Please enter a value',
        ...fooFuncs,
      },
      bar: {
        value: '',
        touched: undefined,
        error: 'Please enter a value',
        ...barFuncs,
      },
    })
  })

  test('values are updated correctly when onChange is called with an event', () => {
    fireEvent.change(getByTestId('foo'), {
      target: {
        value: 'foo value',
      },
    })
    expect(mockFunc.mock.calls[1][0].fields.foo.value).toEqual('foo value')
  })

  test('values are updated correctly when onChange is called with a plain value', () => {
    fireEvent.change(getByTestId('bar'), {
      target: {
        value: 'bar value',
      },
    })
    expect(mockFunc.mock.calls[2][0].fields.bar.value).toEqual('bar value')
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
*/

/* Done
default validate with custom error message
*/
