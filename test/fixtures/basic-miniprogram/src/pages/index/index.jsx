import React, { useState, useEffect } from 'react'
import { View } from '@binance/mp-components'
import Taro, { navigateTo } from '@binance/mp-service'
// import consoleLogMain from '../../utils/consoleLogMain'
import { getRuntimeConfig } from '@shuvi/app';
import { useCurrentRoute } from '@shuvi/app';
import { Link } from '@shuvi/services/router-mp';

globalThis.Taro = Taro;

const runtimeConfig = getRuntimeConfig();
import './index.scss'
import style from './test.scss'

export default () => {
  const { query, params } = useCurrentRoute();
  const [o, setO] = useState({ haha: 123 })
  useEffect(() => {
    console.warn('sdfdsfsdfdf')
  })
  return (
    <View className='index'>
      <View className={style.color} onClick={() => navigateTo({ url: '/pages/sub/index' })}>
        Go to <sub>{o.haha}</sub>
      </View>
      <View onClick={() => navigateTo({ url: '/pages/detail/index?a=b&__params=%7B%22name%22%3A%22success%22%7D'})}>
        Go to detail
      </View>
      <Link to={'/a/b/c?query=query'}>
        link test /a/b/c?query=query
      </Link>
      <Link target={'_blank'} to={'/pages/detail/1?query=other'}>
        link test /pages/detail/1?query=other
      </Link>
      <View onClick={() => navigateTo({ url: '/pages/my/index' })}>
        Go to my
      </View>
      <View onClick={() => navigateTo({ url: '/pages/list/index' })}>
        Go to list
      </View>
      <View>
        runtimeConfig：{JSON.stringify(runtimeConfig)}
      </View>
      <View>query：{JSON.stringify(query)}</View>
      <View>params：{JSON.stringify(params)}</View>
    </View>
  )
}
