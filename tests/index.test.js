import React from 'react'
import { render } from 'react-testing-library'
import useValidation from '..'

// I like how this approach lets me test my hook as if it's a pure function,
// but something about this feels weird 🤔 🤫

// FIXME: Maybe break this up into testing initial state, then testing value, touched, and error separately
test('value, touched, and error update correctly when onChange and onBlur called; custom error message works', () => {
  let counter = 0
  render(
    <Test>
      {fields => {
        const fooFuncs = {
          onChange: fields.foo.onChange,
          onBlur: fields.foo.onBlur,
        }
        const barFuncs = {
          onChange: fields.bar.onChange,
          onBlur: fields.bar.onBlur,
        }

        switch (counter) {
          case 0:
            expect(fields).toEqual({
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

            fields.foo.onChange('foo')
            break
          case 1:
            expect(fields).toEqual({
              foo: {
                value: 'foo',
                touched: undefined,
                error: null,
                ...fooFuncs,
              },
              bar: {
                value: '',
                touched: undefined,
                error: 'Please enter a value',
                ...barFuncs,
              },
            })

            fields.bar.onChange('bar')
            break
          case 2:
            expect(fields).toEqual({
              foo: {
                value: 'foo',
                touched: undefined,
                error: null,
                ...fooFuncs,
              },
              bar: {
                value: 'bar',
                touched: undefined,
                error: null,
                ...barFuncs,
              },
            })

            fields.foo.onBlur()
            break
          case 3:
            expect(fields).toEqual({
              foo: {
                value: 'foo',
                touched: true,
                error: null,
                ...fooFuncs,
              },
              bar: {
                value: 'bar',
                touched: undefined,
                error: null,
                ...barFuncs,
              },
            })

            fields.bar.onBlur()
            break
          case 4:
            expect(fields).toEqual({
              foo: {
                value: 'foo',
                touched: true,
                error: null,
                ...fooFuncs,
              },
              bar: {
                value: 'bar',
                touched: true,
                error: null,
                ...barFuncs,
              },
            })

            fields.foo.onChange('')
            break
          case 5:
            expect(fields).toEqual({
              foo: {
                value: '',
                touched: true,
                error: 'Please enter a value',
                ...fooFuncs,
              },
              bar: {
                value: 'bar',
                touched: true,
                error: null,
                ...barFuncs,
              },
            })

            fields.bar.onChange('')
            break
          case 6:
            expect(fields).toEqual({
              foo: {
                value: '',
                touched: true,
                error: 'Please enter a value',
                ...fooFuncs,
              },
              bar: {
                value: '',
                touched: true,
                error: 'Please enter a value',
                ...barFuncs,
              },
            })

            break
          default:
            break
        }

        counter++
        return null
      }}
    </Test>,
  )

  function Test({ children }) {
    const { fields } = useValidation({
      fields: {
        foo: '',
        bar: '',
      },
      defaultErrorMessage: `Please enter a value`,
    })

    return children(fields)
  }
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
