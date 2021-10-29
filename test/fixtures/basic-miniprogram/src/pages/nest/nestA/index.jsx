import React from 'react';
import { View } from '@tarojs/components'

function NestedA () {
  return (
    <View>
      NestedA render
    </View>
  )
}

NestedA.getInitialProps = ctx => {
  const {query, error} = ctx;
  if(query.a){
    error(500, 'NestedA error');
    return;
  }
  return {};
};

export default NestedA;
