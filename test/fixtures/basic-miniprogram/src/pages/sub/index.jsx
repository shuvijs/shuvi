import React, { Component } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import consoleLogMain from '../../utils/consoleLogMain'

export default class Index extends Component {
  componentDidMount() {
    consoleLogMain()
  }

  render () {
    return (
      <View className='index'>
        <View onClick={() => Taro.navigateTo({ url: '/pages/detail/index' })}>
          Go to detail
        </View>
        <View onClick={() => Taro.navigateTo({ url: '/pages/my/index' })}>
          Go to my
        </View>
        <View onClick={() => Taro.navigateTo({ url: '/pages/list/index' })}>
          Go to list
        </View>
      </View>
    )
  }
}
