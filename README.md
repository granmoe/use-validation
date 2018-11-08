# ✏️ ⚡️ Simple yet robust form validation for React ⚡️ ✏️

The most concise and elegant form validation API known to humankind.

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
    <h1>Validation using h00X, bruh</h1>
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

It's one goddamned object with six motherfucking properties (and only one is required).

Here is the API in its entirety:

```js
const { fields, handleSubmit } = useValidation({
  fields: { foo: 'default value', bar: '' }, // behold, the only required argument
  validate, // defaults to simple "existence" validation function
  validationOptions, // allows you to have any arbitrary extra arg passed to the validation function and onSubmit
  onSubmit, // called when handleSubmit is invoked and fields are all valid
  defaultErrorMessage, // allows passing a custom error message to be used with the default validation function. Defaults to `Looks like that didn't work. Please try again.`
  forceShowOnSubmit, // default to false,
})
```
