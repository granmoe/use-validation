import React from 'react'
import { render, fireEvent } from 'react-testing-library'
import Example from './example'

test('placeholder', () => {
  const testHelpers = render(<Example />)
  testHelpers.debug()
})
