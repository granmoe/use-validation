import React from 'react'
import { string, func, bool } from 'prop-types'
import styled from 'styled-components'

Input.propTypes = {
  name: string,
  value: string,
  error: string,
  touched: bool,
  onChange: func.isRequired,
  onBlur: func.isRequired,
}

export default function Input({
  name = '',
  value = '',
  error = '',
  touched = false,
  onChange,
  onBlur,
}) {
  return (
    <Wrapper>
      <Label htmlFor={name}>{name}:</Label>
      <StyledInput
        value={value}
        id={name}
        onChange={e => void onChange(e.target.value)}
        onBlur={onBlur}
      />
      {touched && error}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin-bottom: 10px;
  color: #68564f;
`

const StyledInput = styled.input`
  color: #68564f;
  border: 1px solid;
  border-radius: 5px;
  padding: 5px;
  margin-right: 5px;
`

const Label = styled.label`
  margin-right: 5px;
`
