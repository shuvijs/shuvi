import React, { useState, useEffect } from 'react'
import { View, Text } from '@binance/mp-components'
import { navigateTo } from '@binance/mp-service';
import { Link } from '@shuvi/runtime/router-mp';
// import consoleLogMain from '../../utils/consoleLogMain'
import './index.scss'
import style from './test.scss'

function IndexPage() {
  useEffect(() => {
    console.warn('useEffect')
  })
  return (
    <View className='index'>
      <View className={style.color} onClick={() => navigateTo({ url: '/pages/sub/index' })}>
        Go to <Text>{o.haha}</Text>
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
      <View onClick={() => navigateTo({ url: '/pages/list/index' })}>
        Go to list
      </View>
      <Link target={'_blank'} to={'/my/a/b/c?query=query'}>
        link test /my/a/b/c?query=query
      </Link>
    </View>
  )
}

export default IndexPage;
