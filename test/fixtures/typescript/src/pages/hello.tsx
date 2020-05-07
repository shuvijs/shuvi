import React from 'react'
import { useLocation } from '@shuvi/app'
import { hello } from '../components/hello'
import { World } from '../components/world'

export default function HelloPage(): JSX.Element {
  const location = useLocation()
  return (
    <div data-test-id="page">
      <div data-test-id="pathname">{location.pathname}</div>
      <p data-test-id="bigInt">One trillion dollars: {1_000_000_000_000}</p>
      {hello()} <World />
    </div>
  )
}
