import React from 'react'
import dynamic from '@shuvi/app/dynamic'

const HmrDynamic = dynamic(() => import('../../components/hmr/dynamic'))

export default () => {
  return <HmrDynamic />
}
