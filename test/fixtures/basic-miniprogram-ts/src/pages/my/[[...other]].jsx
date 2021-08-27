import React, { useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { useCurrentRoute } from '@shuvi/app';

export default () => {
  const { query, params } = useCurrentRoute();
  useEffect (()=>{
    console.log('other Component')
  })
  return (
    <View>
      <View>匹配全部测试 other Component</View>
      <View>query：{JSON.stringify(query)}</View>
      <View>params：{JSON.stringify(params)}</View>
    </View>
  )
}
