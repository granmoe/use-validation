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
    const { add, groups, handleSubmit, areAllValid } = useValidation({
      initialValues: [
        {
          foo: '',
          bar: '',
          baz: '',
        },
      ],
      ...options,
    })

    mockFunc({ add, groups, handleSubmit, areAllValid })

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
              onChange={e => {
                fields.baz.onChange(e.target.value)
              }}
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

describe('use-validation', () => {
  test('fields are initialized correctly', () => {
    const { mockFunc } = setupTest({
      defaultErrorMessage: 'Please enter a value',
    })

    const { groups } = getLastArgs(mockFunc)

    groups.forEach(({ fields }) => {
      expect(fields).toEqual({
        foo: {
          value: '',
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
    const {
      mockFunc,
      renderContext: { getByTestId },
    } = setupTest({
      defaultErrorMessage: 'Please enter a value',
    })

    const { key } = getLastArgsFirstGroup(mockFunc)

    fireEvent.change(getByTestId(`foo-${key}`), {
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
    const {
      mockFunc,
      renderContext: { getByTestId },
    } = setupTest({
      defaultErrorMessage: 'Please enter a value',
    })

    const { key } = getLastArgsFirstGroup(mockFunc)

    fireEvent.change(getByTestId(`baz-${key}`), {
      target: {
        value: 'baz value',
      },
    })

    const { fields } = getLastArgsFirstGroup(mockFunc)

    expect(fields.foo.value).toEqual('')
    expect(fields.bar.value).toEqual('')
    // Baz input calls fields.baz.onChange with e.target.value
    expect(fields.baz.value).toEqual('baz value')
  })

  test('custom error message for defaultValidation is used if passed', () => {
    const { mockFunc } = setupTest({
      defaultErrorMessage: 'Please enter a value',
    })

    const { fields } = getLastArgsFirstGroup(mockFunc)
    expect(fields.foo.error).toEqual('Please enter a value')
  })

  test('default error message used if errorMessage not passed', () => {
    const { mockFunc } = setupTest()
    const { fields } = getLastArgsFirstGroup(mockFunc)
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

    const { fields: prevFields, key } = getLastArgsFirstGroup(mockFunc)

    expect(prevFields.foo.error).toEqual('Please enter a value')
    expect(prevFields.bar.error).toEqual('Please enter a value')
    expect(prevFields.baz.error).toEqual('Please enter a value')

    fireEvent.change(getByTestId(`foo-${key}`), {
      target: {
        value: 'foo value',
      },
    })

    fireEvent.change(getByTestId(`bar-${key}`), {
      target: {
        value: 'bar value',
      },
    })

    const { fields: currentFields } = getLastArgsFirstGroup(mockFunc)

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

    const { fields: fieldsBeforeBlur, key } = getLastArgsFirstGroup(mockFunc)

    expect(fieldsBeforeBlur.foo.touched).toBeFalsy()
    expect(fieldsBeforeBlur.bar.touched).toBeFalsy()
    expect(fieldsBeforeBlur.baz.touched).toBeFalsy()

    fireEvent.blur(getByTestId(`foo-${key}`))

    const { fields: fieldsAfterBlur } = getLastArgsFirstGroup(mockFunc)

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

    const { fields } = getLastArgsFirstGroup(mockFunc)

    expect(fields.foo.touched).toBeTruthy()
    expect(fields.bar.touched).toBeTruthy()
    expect(fields.baz.touched).toBeTruthy()
  })

  test('touched is NOT changed on any fields when handleSubmit is called if forceShowOnSubmit is passed as false', () => {
    const { mockFunc } = setupTest({
      defaultErrorMessage: 'Please enter a value',
      forceShowOnSubmit: false,
    })

    const {
      groups: [{ fields }],
      handleSubmit,
    } = getLastArgs(mockFunc)

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

    const { isValid } = getLastArgsFirstGroup(mockFunc)
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

    const { key } = getLastArgsFirstGroup(mockFunc)

    fireEvent.change(getByTestId(`foo-${key}`), {
      target: {
        value: 'foo value',
      },
    })

    fireEvent.change(getByTestId(`bar-${key}`), {
      target: {
        value: 'bar value',
      },
    })

    fireEvent.change(getByTestId(`baz-${key}`), {
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

    const { key } = getLastArgsFirstGroup(mockFunc)

    fireEvent.change(getByTestId(`foo-${key}`), {
      target: {
        value: 'foo value',
      },
    })

    fireEvent.change(getByTestId(`bar-${key}`), {
      target: {
        value: 'bar value',
      },
    })

    fireEvent.change(getByTestId(`baz-${key}`), {
      target: {
        value: 'baz value',
      },
    })

    const { isValid } = getLastArgsFirstGroup(mockFunc)
    expect(isValid).toBe(true)
  })

  test('handleChange and handleBlur references persist across renders', () => {
    const {
      mockFunc,
      renderContext: { getByTestId },
    } = setupTest({
      defaultErrorMessage: 'Please enter a value',
    })

    const { fields: prevFields, key } = getLastArgsFirstGroup(mockFunc)

    fireEvent.change(getByTestId(`foo-${key}`), {
      target: {
        value: 'foo value',
      },
    })

    fireEvent.change(getByTestId(`bar-${key}`), {
      target: {
        value: 'bar value',
      },
    })

    fireEvent.change(getByTestId(`baz-${key}`), {
      target: {
        value: 'baz value',
      },
    })

    const { fields: currentFields } = getLastArgsFirstGroup(mockFunc)

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

    const {
      groups: [{ key }],
      handleSubmit: prevHandleSubmit,
    } = getLastArgs(mockFunc)

    fireEvent.change(getByTestId(`baz-${key}`), {
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

// FIXME: Break this up into more focused tests and add missing tests
test.only('Everything works when adding / removing groups', () => {
  const {
    mockFunc,
    renderContext: { getByTestId },
  } = setupTest()

  const {
    add,
    groups: [{ key }],
  } = getLastArgs(mockFunc)

  act(() => {
    add()
  })

  fireEvent.change(getByTestId(`baz-${key}`), {
    target: {
      value: 'baz value',
    },
  })

  fireEvent.blur(getByTestId(`baz-${key}`))

  const formatSnapshot = raw => JSON.stringify(raw, null, 2).replace(/\\/g, '')

  expect(formatSnapshot(getLastArgs(mockFunc))).toMatchInlineSnapshot(`
    "{
      \\"groups\\": [
        {
          \\"key\\": 0,
          \\"isValid\\": false,
          \\"fields\\": {
            \\"foo\\": {
              \\"error\\": \\"Looks like that didn't work. Please try again.\\",
              \\"touched\\": false,
              \\"value\\": \\"\\"
            },
            \\"bar\\": {
              \\"error\\": \\"Looks like that didn't work. Please try again.\\",
              \\"touched\\": false,
              \\"value\\": \\"\\"
            },
            \\"baz\\": {
              \\"error\\": null,
              \\"touched\\": true,
              \\"value\\": \\"baz value\\"
            }
          }
        },
        {
          \\"key\\": 3,
          \\"isValid\\": false,
          \\"fields\\": {
            \\"foo\\": {
              \\"error\\": \\"Looks like that didn't work. Please try again.\\",
              \\"touched\\": false,
              \\"value\\": \\"\\"
            },
            \\"bar\\": {
              \\"error\\": \\"Looks like that didn't work. Please try again.\\",
              \\"touched\\": false,
              \\"value\\": \\"\\"
            },
            \\"baz\\": {
              \\"error\\": \\"Looks like that didn't work. Please try again.\\",
              \\"touched\\": false,
              \\"value\\": \\"\\"
            }
          }
        }
      ],
      \\"areAllValid\\": false
    }"
  `)

  // Make all groups valid...

  fireEvent.change(getByTestId(`foo-${key}`), {
    target: {
      value: 'foo value',
    },
  })

  fireEvent.change(getByTestId(`bar-${key}`), {
    target: {
      value: 'bar value',
    },
  })

  const {
    groups: [_, { key: secondKey }],
  } = getLastArgs(mockFunc)

  fireEvent.change(getByTestId(`foo-${secondKey}`), {
    target: {
      value: 'foo value',
    },
  })

  fireEvent.change(getByTestId(`bar-${secondKey}`), {
    target: {
      value: 'bar value',
    },
  })

  fireEvent.change(getByTestId(`baz-${secondKey}`), {
    target: {
      value: 'baz value',
    },
  })

  expect(formatSnapshot(getLastArgs(mockFunc))).toMatchInlineSnapshot(`
    "{
      \\"groups\\": [
        {
          \\"key\\": 0,
          \\"isValid\\": true,
          \\"fields\\": {
            \\"foo\\": {
              \\"error\\": null,
              \\"touched\\": false,
              \\"value\\": \\"foo value\\"
            },
            \\"bar\\": {
              \\"error\\": null,
              \\"touched\\": false,
              \\"value\\": \\"bar value\\"
            },
            \\"baz\\": {
              \\"error\\": null,
              \\"touched\\": true,
              \\"value\\": \\"baz value\\"
            }
          }
        },
        {
          \\"key\\": 3,
          \\"isValid\\": true,
          \\"fields\\": {
            \\"foo\\": {
              \\"error\\": null,
              \\"touched\\": false,
              \\"value\\": \\"foo value\\"
            },
            \\"bar\\": {
              \\"error\\": null,
              \\"touched\\": false,
              \\"value\\": \\"bar value\\"
            },
            \\"baz\\": {
              \\"error\\": null,
              \\"touched\\": false,
              \\"value\\": \\"baz value\\"
            }
          }
        }
      ],
      \\"areAllValid\\": true
    }"
  `)

  const {
    groups: [{ remove }],
  } = getLastArgs(mockFunc)

  act(() => {
    remove()
  })

  expect(formatSnapshot(getLastArgs(mockFunc))).toMatchInlineSnapshot(`
    "{
      \\"groups\\": [
        {
          \\"key\\": 3,
          \\"isValid\\": true,
          \\"fields\\": {
            \\"foo\\": {
              \\"error\\": null,
              \\"touched\\": false,
              \\"value\\": \\"foo value\\"
            },
            \\"bar\\": {
              \\"error\\": null,
              \\"touched\\": false,
              \\"value\\": \\"bar value\\"
            },
            \\"baz\\": {
              \\"error\\": null,
              \\"touched\\": false,
              \\"value\\": \\"baz value\\"
            }
          }
        }
      ],
      \\"areAllValid\\": true
    }"
  `)

  const {
    groups: [{ remove: removeLastGroup }],
    add: addGroup, // TODO: Awkward name...just avoiding name collision
  } = getLastArgs(mockFunc)

  act(() => {
    removeLastGroup()
  })

  expect(formatSnapshot(getLastArgs(mockFunc))).toMatchInlineSnapshot(`
    "{
      \\"groups\\": [],
      \\"areAllValid\\": true
    }"
  `)

  act(() => {
    addGroup()
  })

  expect(formatSnapshot(getLastArgs(mockFunc))).toMatchInlineSnapshot(`
    "{
      \\"groups\\": [
        {
          \\"key\\": 14,
          \\"isValid\\": false,
          \\"fields\\": {
            \\"foo\\": {
              \\"error\\": \\"Looks like that didn't work. Please try again.\\",
              \\"touched\\": false,
              \\"value\\": \\"\\"
            },
            \\"bar\\": {
              \\"error\\": \\"Looks like that didn't work. Please try again.\\",
              \\"touched\\": false,
              \\"value\\": \\"\\"
            },
            \\"baz\\": {
              \\"error\\": \\"Looks like that didn't work. Please try again.\\",
              \\"touched\\": false,
              \\"value\\": \\"\\"
            }
          }
        }
      ],
      \\"areAllValid\\": false
    }"
  `)
})

/* MISSING TESTS
 * remove and add are stable across renders
 * init with multiple groups
 * a whole bunch more
 */
