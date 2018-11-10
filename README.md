# ✏️ ⚡️ Simple yet robust form validation for React ⚡️ ✏️

The most concise and elegant form validation API known to humankind.

_Weighing in at a whopping 1 kB gzipped and minified._

## Installation

### Note that this library requires the new React "hooks" API!

`yarn add use-validation`

## Examples

### Simplest Case (a few simple inputs, default validation function)

```js
const { fields, handleSubmit } = useValidation({
  fields: { foo: '', bar: '' },
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

[Try this example on CodeSandbox!](https://codesandbox.io/embed/qknzy1qk9q?module=%2Fsrc%2Fexample.js)

## API

### Input

It's one goddamned object with six motherfucking properties (and only one is required).

This snippet shows the API in its entirety:

```js
const { fields, handleSubmit } = useValidation({
  fields: { foo: 'default value', bar: '' }, // behold, the only required argument
  validate, // defaults to simple "existence" validation function, receives values by field name object and validationOptions as arguments, should return an object with errors by field name
  validationOptions, // allows you to have any arbitrary extra arg passed to the validation function and onSubmit
  onSubmit, // called when handleSubmit is invoked and fields are all valid, receives values by field name object and validationOptions as arguments
  defaultErrorMessage, // allows passing a custom error message to be used with the default validation function. Defaults to `Looks like that didn't work. Please try again.`
  forceShowOnSubmit, // defaults to true,
})
```

### Output

An object with two keys: `fields` and `handleSubmit`.

`fields` is an object that contains the following keys for each field you passed in:

- `value`: the value of the field
- `touched`: whether the field has been blurred
- `error`: any error message returned from the validate function for this field
- `onChange`: call this with either a value or an event to update the field's value
- `onBlur`: call this to set touched to `true` for the field

`handleSubmit` is a function that will call your `onSubmit` (if you passed one). If forceShowOnSubmit is true, `touched` will be set to true on all fields when `handleSubmit` is invoked.
