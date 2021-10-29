import React from 'react';
import { View } from '@tarojs/components'

function NestedB () {
  return (
    <View>
      NestedB render
    </View>
  )
}

NestedB.getInitialProps = ctx => {
  const {query, error} = ctx;
  if(query.b){
    error(500, 'NestedB error');
    return;
  }
  return {};
};

export default NestedB;
