import React, { useState, useEffect } from 'react'
import { View } from '@binance/mp-components'
import { navigateTo } from '@binance/mp-service'
// import consoleLogMain from '../../utils/consoleLogMain'
import './index.scss'
import style from './test.scss'
export default () => {
  const [o, setO] = useState({ haha: 1234 })
  useEffect(() => {
    console.warn('sdfdsfsdfdf')
    debugger;
  })
  return (
    <View className='index'>
      <View className={style.color} onClick={() => navigateTo({ url: '/pages/sub/index' })}>
        Go to <sub>{o.haha}</sub>
      </View>
      <View onClick={() => navigateTo({ url: '/pages/detail/index' })}>
        Go to detail
      </View>
      <View onClick={() => navigateTo({ url: '/pages/my/index' })}>
        Go to my
      </View>
      <View onClick={() => navigateTo({ url: '/pages/list/index' })}>
        Go to list
      </View>
    </View>
  )
}
