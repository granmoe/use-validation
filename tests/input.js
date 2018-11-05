import React, { Component } from 'react'
import styled from 'styled-components'

export default ({ name, value, error, touched, onChange, onBlur }) => {
  return (
    <Wrapper>
      <Label htmlFor={name}>{name}:</Label>
      <Input
        value={value}
        onChange={e =>
          console.log(typeof e.target) || void onChange(e.target.value)
        }
        onBlur={onBlur}
        id={name}
      />
      {touched && error}
    </Wrapper>
  )
}

const Wrapper = styled.div` 
  margin-bottom: 10px;
  color: #68564f;
`

const Input = styled.input`
  color: #68564f;
  border: 1px solid;
  border-radius: 5px;
  padding: 5px;
  margin-right: 5px;
`

const Label = styled.label` 
  margin-right: 5px;
`
