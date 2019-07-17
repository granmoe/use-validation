# ✏️ ⚡️ Simple yet robust form validation for React ⚡️ ✏️

The most concise and elegant form validation API known to humankind.

_Weighing in at a whopping 1.1 kB gzipped and minified._

## Installation

### Note that this library requires the new React "hooks" API!

`yarn add use-validation`

## Examples

### Simplest Case (a few simple inputs, default validation function)

```js
const { fields, handleSubmit } = useValidation({
  initialValues: { foo: '', bar: '' },
})

return (
  <Wrapper>
    <h1>Validation using hūX</h1>
    <form
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Input {...fields.foo} name="foo" />
      <Input {...fields.bar} name="bar" />
      <Button type="submit">Submit</Button>
    </form>
  </Wrapper>
)
```

_[Try this example on CodeSandbox!](https://codesandbox.io/embed/qknzy1qk9q?module=%2Fsrc%2Fexample.js)_

## API

### Input

It's one object with six properties (and only one is required).

This snippet shows the API in its entirety:

```js
const myValidationFunc = (
  { foo, bar },
  { someRandomThing, someOtherJunk },
) => ({
  foo:
    typeof foo !== 'number'
      ? 'Please enter a number'
      : foo === someOtherJunk
        ? `foo cannot be ${someOtherJunk}`
        : null,
  bar: bar === someRandomThing ? `bar cannot be ${someRandomThing}` : null,
})

const { fields, handleSubmit } = useValidation({
  initialValues: { foo: 'default value', bar: '' },
  validate: myValidationFunc,
  validationOptions: {
    someRandomThing: 'asdf',
    someOtherJunk: 123,
  },
  onSubmit: (values, { someRandomThing }) => {
    updateUser(values)
    doOtherThings({ someRandomThing })
  },
  defaultErrorMessage: `This won't have any effect in this case since we're using a custom validation function.`,
  forceShowOnSubmit: false,
})
```

#### Options

| Name                  | Type                | Description                                                                                                                                                                                              | Default Value                                      | Required? |
| --------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | --------- |
| `initialValues`       | { [string]: [any] } | An object with field names as keys and their initial values as values. Only field names in this object will be returned by the hook, so include the field here even if the initial value is `undefined`. |                                                    | Yes       |
| `validate`            | function            | A function that will receive two arguments: an object with field values by name and validationOptions. Should return an object with errors (or any falsy value to represent no error) by field name.     | Simple, truthy validation function                 | No        |
| `validationOptions`   | any                 | Allows any arbitrary second argument to be passed to `validate` and `onSubmit`. Used primarily for looking at values outside of your fields when validating.                                             |                                                    | No        |
| `onSubmit`            | function            | Called by the hook when `handleSubmit` is invoked and all fields are valid. Passed the same arguments as `validate`.                                                                                     |                                                    | No        |
| `defaultErrorMessage` | string              | The error message that will be set to a field by the default validation function.                                                                                                                        | `"Looks like that didn't work. Please try again."` | No        |
| `forceShowOnSubmit`   | boolean             | Causes touched to be set to true for all fields when `handleSubmit` is invoked.                                                                                                                          | `true`                                             | No        |

### Output

An object with two keys: `fields` and `handleSubmit`.

`fields` is an object that contains the following keys for each field you passed in:

- `value`: the value of the field
- `touched`: whether the field has been blurred
- `error`: any error message returned from the validate function for this field
- `onChange`: call this with either a value or an event to update the field's value
- `onBlur`: call this to set touched to `true` for the field

`handleSubmit` is a function that will call `onSubmit` (if it was passed). If forceShowOnSubmit is true, `touched` will be set to true on all fields when `handleSubmit` is invoked.
