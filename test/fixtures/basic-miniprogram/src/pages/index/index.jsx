import React, { Component } from 'react'
import { View } from '@binance/mp-components'
import { navigateTo } from '@binance/mp-service'
import consoleLogMain from '../../utils/consoleLogMain'
import './index.scss'
export default class Index extends Component {
  componentDidMount() {
    consoleLogMain()
  }

  render () {
    return (
      <View className='index'>
        <View onClick={() => navigateTo({ url: '/pages/sub/index' })}>
          Go to sub
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
}
