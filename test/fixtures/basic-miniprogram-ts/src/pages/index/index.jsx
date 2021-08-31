import React, { useState, useEffect } from 'react'
import { View } from '@binance/mp-components'
import { navigateTo } from '@binance/mp-service';
import { Link } from '@shuvi/services/router-mp';
// import consoleLogMain from '../../utils/consoleLogMain'
import './index.scss'
import style from './test.scss'

function IndexPage({success}) {
  const [o, setO] = useState({ haha: 1234 })
  useEffect(() => {
    console.warn('sdfdsfsdfdf')
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
      <View onClick={() => navigateTo({ url: '/pages/list/index' })}>
        Go to list
      </View>
      <Link target={'_blank'} to={'/my/a/b/c?query=query'}>
        link test /my/a/b/c?query=query
      </Link>
      <View>routeProps：{JSON.stringify({
        success,
      })}</View>
    </View>
  )
}

IndexPage.getInitialProps = ctx => {
  console.log('getInitialProps')
  return {
    success: 'ok'
  };
};

export default IndexPage;
