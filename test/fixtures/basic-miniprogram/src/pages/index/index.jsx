import React, { useState, useEffect } from 'react'
import { View, Text } from '@binance/mp-components'
import Taro, { navigateTo } from '@binance/mp-service'
// import consoleLogMain from '../../utils/consoleLogMain'
import { getRuntimeConfig, useCurrentRoute, Head, getPageData, dynamic, Link } from '@shuvi/app';
import Extend from '../../components/extend'
const Welcome = dynamic(() => import("../../components/welcome"));
const Nested = dynamic(() => import("../../components/nested1"));
const Hello = dynamic(async () => {
  await new Promise(resolve => setTimeout(() => resolve(), 1000));
  return import("../../components/hello")
}, {
  ssr: false,
  loading: () => <Text>LOADING Hello</Text>
});

globalThis.Taro = Taro;

const runtimeConfig = getRuntimeConfig();
import './index.scss'
import style from './test.scss'

function IndexPage ({success, routePropsTest}) {
  const { query, params } = useCurrentRoute();
  const [o, setO] = useState({ haha: 123 })
  useEffect(() => {
    console.warn('useEffect');
    console.log('getPageData', getPageData())
  }, [])
  return (
    <View className='index'>
      <Head>
        <Text>head content</Text>
      </Head>
      <View className={style.color} onClick={() => navigateTo({ url: '/pages/sub/index' })}>
        Go to <Text>{o.haha}</Text>
      </View>
      <View onClick={() => navigateTo({ url: '/pages/detail/index?a=b&__params=%7B%22name%22%3A%22success%22%7D'})}>
        Go to detail
      </View>
      <Link to={'/a/b/c?query=query'}>
        link test /a/b/c?query=query
      </Link>
      <Link to={'/error'}>
        link test /error
      </Link>
      <Link to={'/error?a=1'}>
        link test /error?a=1
      </Link>
      <Link to={'/error/1/2/3/4?a=1'}>
        link test /error/1/2/3/4?a=1
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
      <View>routeProps：{JSON.stringify({
        success,
        routePropsTest
      })}</View>
      <Hello />
      <Nested />
      <Welcome name="normal" />
      <Welcome name="dynamic" />
      <Extend />
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
