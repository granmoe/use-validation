import React from 'react'
import styled from 'styled-components'
import useValidation from '../index'
import Input from './input'

export default function Form() {
  // Using default validate func
  const { fields, handleSubmit } = useValidation({
    fields: {
      foo: '',
      bar: '',
    },
    defaultErrorMessage: `Please enter a value`,
    onSubmit: values => {
      alert(`Valid form submitted: ${JSON.stringify(values)}`)
    },
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
}

const Wrapper = styled.div`
  margin: 15px;
  font-family: 'Arial';
  color: #61dafb;
`

const Button = styled.button`
  color: #68564f;
  border: 1px solid;
  border-radius: 5px;
  padding: 5px;
`
