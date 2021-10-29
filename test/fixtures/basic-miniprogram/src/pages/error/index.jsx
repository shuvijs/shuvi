import React from 'react';
import { View } from '@tarojs/components'

function ErrorPage () {
  return (
    <View>
      no error called
    </View>
  )
}

ErrorPage.getInitialProps = ctx => {
  console.log(ctx);
  const {query, error} = ctx;
  if(query.a){
    error(502, 'custom error');
    return;
  }
  return {
    success: 'ok'
  };
};

export default ErrorPage;
