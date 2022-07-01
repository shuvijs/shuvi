import React, { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getRuntimeConfig, useCurrentRoute } from '@shuvi/runtime';
import consoleLogMain from '../../utils/consoleLogMain'
import consoleLogSubVendors from '../../utils/consoleLogSubVendors'
import testExcludeString from '../../utils/testExcludeString'
import './index.css'
import '../../css/sub-vendors.css'
import '../../css/sub-common.css'
import subCommonStyles from '../../css/sub-common.module.css'
import vendorsStyles from '../../css/sub-vendors.module.css'
import { navigateBack } from '@shuvi/runtime/router-mp';
import _ from 'lodash'
const runtimeConfig = getRuntimeConfig();

function Detail() {
  const { query, params } = useCurrentRoute();
  useEffect(()=>{
    consoleLogMain()
    consoleLogSubVendors()
    testExcludeString()
  }, [])
  return (
    <View className='detail'>
      <Text className={`
          sub-vendors
          sub-common
          ${subCommonStyles['sub-common-module']}
          ${vendorsStyles['sub-vendors-module']}
        `}>I m detail
      </Text>
      <View onClick={()=>navigateBack(-1)}>
        test go back -1
      </View>
      <View onClick={() => Taro.navigateTo({ url: '/pages/index/index' })}>
        Go to index
      </View>
      <View onClick={() => Taro.navigateTo({ url: '/pages/my/index' })}>
        Go to my
      </View>
      <View>
        runtimeConfig：{JSON.stringify(runtimeConfig)}
      </View>
      <View>query：{JSON.stringify(query)}</View>
      <View>params：{JSON.stringify(params)}</View>
    </View>
  )
}

export default Detail;
