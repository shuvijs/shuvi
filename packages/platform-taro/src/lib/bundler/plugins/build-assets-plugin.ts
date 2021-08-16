import webpack, { Compiler, Compilation } from 'webpack';
const { RawSource } = webpack.sources;

// add extra asset files
export default class BuildAssetsPlugin {
  constructor() {}

  apply(compiler: Compiler) {
    compiler.hooks.make.tap('BuildAssetsPlugin', (compilation: Compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'BuildAssetsPlugin',
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
        },
        assets => {
          // todo set real file contents by user file
          assets['app.json'] = new RawSource(
            '{"pages":["pages/index/index","pages/sub/index"],"window":{"backgroundTextStyle":"light","navigationBarBackgroundColor":"#fff","navigationBarTitleText":"WeChat","navigationBarTextStyle":"black"}}',
            true
          );
          assets['base.wxml'] = new RawSource(
            `
          <wxs module="xs" src="./utils.wxs" />
<template name="taro_tmpl">
  <block wx:for="{{root.cn}}" wx:key="uid">
    <template is="tmpl_0_container" data="{{i:item,l:''}}" />
  </block>
</template>

<template name="tmpl_0_catch-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh" catchtouchmove="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_0_static-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_0_pure-view">
  <view style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_0_view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_0_static-text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_0_text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_0_button">
  <button size="{{xs.b(i.size,'default')}}" type="{{i.type}}" plain="{{xs.b(i.plain,false)}}" disabled="{{i.disabled}}" loading="{{xs.b(i.loading,false)}}" form-type="{{i.formType}}" open-type="{{i.openType}}" hover-class="{{xs.b(i.hoverClass,'button-hover')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,20)}}" hover-stay-time="{{xs.b(i.hoverStayTime,70)}}" name="{{i.name}}" lang="{{xs.b(i.lang,en)}}" session-from="{{i.sessionFrom}}" send-message-title="{{i.sendMessageTitle}}" send-message-path="{{i.sendMessagePath}}" send-message-img="{{i.sendMessageImg}}" app-parameter="{{i.appParameter}}" show-message-card="{{xs.b(i.showMessageCard,false)}}" business-id="{{i.businessId}}" bindgetuserinfo="eh" bindcontact="eh" bindgetphonenumber="eh" binderror="eh" bindopensetting="eh" bindlaunchapp="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </button>
</template>

<template name="tmpl_0_scroll-view">
  <scroll-view scroll-x="{{xs.b(i.scrollX,false)}}" scroll-y="{{xs.b(i.scrollY,false)}}" upper-threshold="{{xs.b(i.upperThreshold,50)}}" lower-threshold="{{xs.b(i.lowerThreshold,50)}}" scroll-top="{{i.scrollTop}}" scroll-left="{{i.scrollLeft}}" scroll-into-view="{{i.scrollIntoView}}" scroll-with-animation="{{xs.b(i.scrollWithAnimation,false)}}" enable-back-to-top="{{xs.b(i.enableBackToTop,false)}}" bindscrolltoupper="eh" bindscrolltolower="eh" bindscroll="eh" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" enable-flex="{{xs.b(i.enableFlex,false)}}" scroll-anchoring="{{xs.b(i.scrollAnchoring,false)}}" refresher-enabled="{{xs.b(i.refresherEnabled,false)}}" refresher-threshold="{{xs.b(i.refresherThreshold,45)}}" refresher-default-style="{{xs.b(i.refresherDefaultStyle,'black')}}" refresher-background="{{xs.b(i.refresherBackground,'#FFF')}}" refresher-triggered="{{xs.b(i.refresherTriggered,false)}}" enhanced="{{xs.b(i.enhanced,false)}}" bounces="{{xs.b(i.bounces,true)}}" show-scrollbar="{{xs.b(i.showScrollbar,true)}}" paging-enabled="{{xs.b(i.pagingEnabled,false)}}" fast-deceleration="{{xs.b(i.fastDeceleration,false)}}" binddragstart="eh" binddragging="eh" binddragend="eh" bindrefresherpulling="eh" bindrefresherrefresh="eh" bindrefresherrestore="eh" bindrefresherabort="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </scroll-view>
</template>

<template name="tmpl_0_static-image">
  <image src="{{i.src}}" mode="{{xs.b(i.mode,'scaleToFill')}}" lazy-load="{{xs.b(i.lazyLoad,false)}}" webp="{{xs.b(i.webp,false)}}" show-menu-by-longpress="{{xs.b(i.showMenuByLongpress,false)}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </image>
</template>

<template name="tmpl_0_image">
  <image src="{{i.src}}" mode="{{xs.b(i.mode,'scaleToFill')}}" lazy-load="{{xs.b(i.lazyLoad,false)}}" binderror="eh" bindload="eh" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" webp="{{xs.b(i.webp,false)}}" show-menu-by-longpress="{{xs.b(i.showMenuByLongpress,false)}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </image>
</template>

<template name="tmpl_0_#text" data="{{i:i}}">
  <block>{{i.v}}</block>
</template>

<template name="tmpl_0_container">
  <template is="{{xs.a(0, i.nn, l)}}" data="{{i:i,cid:0,l:xs.f(l,i.nn)}}" />
</template>

<template name="tmpl_1_catch-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh" catchtouchmove="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_1_static-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_1_pure-view">
  <view style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_1_view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_1_static-text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_1_text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_1_scroll-view">
  <scroll-view scroll-x="{{xs.b(i.scrollX,false)}}" scroll-y="{{xs.b(i.scrollY,false)}}" upper-threshold="{{xs.b(i.upperThreshold,50)}}" lower-threshold="{{xs.b(i.lowerThreshold,50)}}" scroll-top="{{i.scrollTop}}" scroll-left="{{i.scrollLeft}}" scroll-into-view="{{i.scrollIntoView}}" scroll-with-animation="{{xs.b(i.scrollWithAnimation,false)}}" enable-back-to-top="{{xs.b(i.enableBackToTop,false)}}" bindscrolltoupper="eh" bindscrolltolower="eh" bindscroll="eh" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" enable-flex="{{xs.b(i.enableFlex,false)}}" scroll-anchoring="{{xs.b(i.scrollAnchoring,false)}}" refresher-enabled="{{xs.b(i.refresherEnabled,false)}}" refresher-threshold="{{xs.b(i.refresherThreshold,45)}}" refresher-default-style="{{xs.b(i.refresherDefaultStyle,'black')}}" refresher-background="{{xs.b(i.refresherBackground,'#FFF')}}" refresher-triggered="{{xs.b(i.refresherTriggered,false)}}" enhanced="{{xs.b(i.enhanced,false)}}" bounces="{{xs.b(i.bounces,true)}}" show-scrollbar="{{xs.b(i.showScrollbar,true)}}" paging-enabled="{{xs.b(i.pagingEnabled,false)}}" fast-deceleration="{{xs.b(i.fastDeceleration,false)}}" binddragstart="eh" binddragging="eh" binddragend="eh" bindrefresherpulling="eh" bindrefresherrefresh="eh" bindrefresherrestore="eh" bindrefresherabort="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </scroll-view>
</template>

<template name="tmpl_1_container">
  <template is="{{xs.a(1, i.nn, l)}}" data="{{i:i,cid:1,l:xs.f(l,i.nn)}}" />
</template>

<template name="tmpl_2_catch-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh" catchtouchmove="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_2_static-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_2_pure-view">
  <view style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_2_view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_2_static-text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_2_text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_2_scroll-view">
  <scroll-view scroll-x="{{xs.b(i.scrollX,false)}}" scroll-y="{{xs.b(i.scrollY,false)}}" upper-threshold="{{xs.b(i.upperThreshold,50)}}" lower-threshold="{{xs.b(i.lowerThreshold,50)}}" scroll-top="{{i.scrollTop}}" scroll-left="{{i.scrollLeft}}" scroll-into-view="{{i.scrollIntoView}}" scroll-with-animation="{{xs.b(i.scrollWithAnimation,false)}}" enable-back-to-top="{{xs.b(i.enableBackToTop,false)}}" bindscrolltoupper="eh" bindscrolltolower="eh" bindscroll="eh" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" enable-flex="{{xs.b(i.enableFlex,false)}}" scroll-anchoring="{{xs.b(i.scrollAnchoring,false)}}" refresher-enabled="{{xs.b(i.refresherEnabled,false)}}" refresher-threshold="{{xs.b(i.refresherThreshold,45)}}" refresher-default-style="{{xs.b(i.refresherDefaultStyle,'black')}}" refresher-background="{{xs.b(i.refresherBackground,'#FFF')}}" refresher-triggered="{{xs.b(i.refresherTriggered,false)}}" enhanced="{{xs.b(i.enhanced,false)}}" bounces="{{xs.b(i.bounces,true)}}" show-scrollbar="{{xs.b(i.showScrollbar,true)}}" paging-enabled="{{xs.b(i.pagingEnabled,false)}}" fast-deceleration="{{xs.b(i.fastDeceleration,false)}}" binddragstart="eh" binddragging="eh" binddragend="eh" bindrefresherpulling="eh" bindrefresherrefresh="eh" bindrefresherrestore="eh" bindrefresherabort="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </scroll-view>
</template>

<template name="tmpl_2_container">
  <template is="{{xs.a(2, i.nn, l)}}" data="{{i:i,cid:2,l:xs.f(l,i.nn)}}" />
</template>

<template name="tmpl_3_catch-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh" catchtouchmove="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_3_static-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_3_pure-view">
  <view style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_3_view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_3_static-text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_3_text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_3_scroll-view">
  <scroll-view scroll-x="{{xs.b(i.scrollX,false)}}" scroll-y="{{xs.b(i.scrollY,false)}}" upper-threshold="{{xs.b(i.upperThreshold,50)}}" lower-threshold="{{xs.b(i.lowerThreshold,50)}}" scroll-top="{{i.scrollTop}}" scroll-left="{{i.scrollLeft}}" scroll-into-view="{{i.scrollIntoView}}" scroll-with-animation="{{xs.b(i.scrollWithAnimation,false)}}" enable-back-to-top="{{xs.b(i.enableBackToTop,false)}}" bindscrolltoupper="eh" bindscrolltolower="eh" bindscroll="eh" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" enable-flex="{{xs.b(i.enableFlex,false)}}" scroll-anchoring="{{xs.b(i.scrollAnchoring,false)}}" refresher-enabled="{{xs.b(i.refresherEnabled,false)}}" refresher-threshold="{{xs.b(i.refresherThreshold,45)}}" refresher-default-style="{{xs.b(i.refresherDefaultStyle,'black')}}" refresher-background="{{xs.b(i.refresherBackground,'#FFF')}}" refresher-triggered="{{xs.b(i.refresherTriggered,false)}}" enhanced="{{xs.b(i.enhanced,false)}}" bounces="{{xs.b(i.bounces,true)}}" show-scrollbar="{{xs.b(i.showScrollbar,true)}}" paging-enabled="{{xs.b(i.pagingEnabled,false)}}" fast-deceleration="{{xs.b(i.fastDeceleration,false)}}" binddragstart="eh" binddragging="eh" binddragend="eh" bindrefresherpulling="eh" bindrefresherrefresh="eh" bindrefresherrestore="eh" bindrefresherabort="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </scroll-view>
</template>

<template name="tmpl_3_container">
  <template is="{{xs.a(3, i.nn, l)}}" data="{{i:i,cid:3,l:xs.f(l,i.nn)}}" />
</template>

<template name="tmpl_4_catch-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh" catchtouchmove="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_4_static-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_4_pure-view">
  <view style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_4_view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_4_static-text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_4_text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_4_container">
  <template is="{{xs.a(4, i.nn, l)}}" data="{{i:i,cid:4,l:xs.f(l,i.nn)}}" />
</template>

<template name="tmpl_5_catch-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh" catchtouchmove="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_5_static-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_5_pure-view">
  <view style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_5_view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_5_static-text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_5_text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_5_container">
  <template is="{{xs.a(5, i.nn, l)}}" data="{{i:i,cid:5,l:xs.f(l,i.nn)}}" />
</template>

<template name="tmpl_6_catch-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh" catchtouchmove="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_6_static-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_6_pure-view">
  <view style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_6_view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_6_text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_6_container">
  <template is="{{xs.a(6, i.nn, l)}}" data="{{i:i,cid:6,l:xs.f(l,i.nn)}}" />
</template>

<template name="tmpl_7_catch-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh" catchtouchmove="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_7_static-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_7_pure-view">
  <view style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_7_view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_7_text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_7_container">
  <template is="{{xs.a(7, i.nn, l)}}" data="{{i:i,cid:7,l:xs.f(l,i.nn)}}" />
</template>

<template name="tmpl_8_catch-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh" catchtouchmove="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_8_static-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_8_pure-view">
  <view style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_8_view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_8_text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_8_container">
  <template is="{{xs.a(8, i.nn, l)}}" data="{{i:i,cid:8,l:xs.f(l,i.nn)}}" />
</template>

<template name="tmpl_9_catch-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh" catchtouchmove="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_9_static-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_9_pure-view">
  <view style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_9_view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_9_text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_9_container">
  <template is="{{xs.a(9, i.nn, l)}}" data="{{i:i,cid:9,l:xs.f(l,i.nn)}}" />
</template>

<template name="tmpl_10_catch-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh" catchtouchmove="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_10_static-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_10_pure-view">
  <view style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_10_view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_10_text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_10_container">
  <template is="{{xs.a(10, i.nn, l)}}" data="{{i:i,cid:10,l:xs.f(l,i.nn)}}" />
</template>

<template name="tmpl_11_catch-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh" catchtouchmove="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_11_static-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_11_pure-view">
  <view style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_11_view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_11_text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_11_container">
  <template is="{{xs.a(11, i.nn, l)}}" data="{{i:i,cid:11,l:xs.f(l,i.nn)}}" />
</template>

<template name="tmpl_12_catch-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh" catchtouchmove="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_12_static-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_12_pure-view">
  <view style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_12_view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_12_text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_12_container">
  <template is="{{xs.a(12, i.nn, l)}}" data="{{i:i,cid:12,l:xs.f(l,i.nn)}}" />
</template>

<template name="tmpl_13_catch-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh" catchtouchmove="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_13_static-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_13_pure-view">
  <view style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_13_view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_13_text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_13_container">
  <template is="{{xs.a(13, i.nn, l)}}" data="{{i:i,cid:13,l:xs.f(l,i.nn)}}" />
</template>

<template name="tmpl_14_catch-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh" catchtouchmove="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_14_static-view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_14_pure-view">
  <view style="{{i.st}}" class="{{i.cl}}"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_14_view">
  <view hover-class="{{xs.b(i.hoverClass,'none')}}" hover-stop-propagation="{{xs.b(i.hoverStopPropagation,false)}}" hover-start-time="{{xs.b(i.hoverStartTime,50)}}" hover-stay-time="{{xs.b(i.hoverStayTime,400)}}" animation="{{i.animation}}" bindtouchstart="eh" bindtouchmove="eh" bindtouchend="eh" bindtouchcancel="eh" bindlongpress="eh" bindanimationstart="eh" bindanimationiteration="eh" bindanimationend="eh" bindtransitionend="eh" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </view>
</template>

<template name="tmpl_14_text">
  <text selectable="{{xs.b(i.selectable,false)}}" space="{{i.space}}" decode="{{xs.b(i.decode,false)}}" user-select="{{xs.b(i.userSelect,false)}}" style="{{i.st}}" class="{{i.cl}}" bindtap="eh"  id="{{i.uid}}">
    <block wx:for="{{i.cn}}" wx:key="uid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </text>
</template>

<template name="tmpl_14_container">
  <template is="{{xs.a(14, i.nn, l)}}" data="{{i:i,cid:14,l:xs.f(l,i.nn)}}" />
</template>

<template name="tmpl_15_container">
  <block wx:if="{{i.nn === '#text'}}">
    <template is="tmpl_0_#text" data="{{i:i}}" />
  </block>
  <block wx:else>
    <comp i="{{i}}" l="{{l}}" />
  </block>
</template>

          `,
            true
          );
          assets['utils.wxs'] = new RawSource(
            `module.exports = {
  a: function (l, n, s) {
    var a = ["view","catch-view","cover-view","static-view","pure-view","block","text","static-text","slot","slot-view","label","form","scroll-view","swiper","swiper-item"]
    var b = ["static-text","slot","slot-view","label","form","scroll-view","swiper","swiper-item"]
    if (a.indexOf(n) === -1) {
      l = 0
    }
    if (b.indexOf(n) > -1) {
      var u = s.split(',')
      var depth = 0
      for (var i = 0; i < u.length; i++) {
        if (u[i] === n) depth++
      }
      l = depth
    }
    return 'tmpl_' + l + '_' + n
  },
  b: function (a, b) {
    return a === undefined ? b : a
  },
  c: function(i, prefix) {
    var s = i.focus !== undefined ? 'focus' : 'blur'
    return prefix + i.nn + '_' + s
  },
  d: function (i, v) {
    return i === undefined ? v : i
  },
  e: function (n) {
    return 'tmpl_' + n + '_container'
  },
  f: function (l, n) {
    var b = ["static-text","slot","slot-view","label","form","scroll-view","swiper","swiper-item"]
    if (b.indexOf(n) > -1) {
      if (l) l += ','
      l += n
    }
    return l
  }
}`,
            true
          );
          assets['comp.wxml'] = new RawSource(
            `<import src="./base.wxml" />
<template is="tmpl_0_container" data="{{i:i,l:l}}" />`,
            true
          );
          assets['comp.json'] = new RawSource(
            '{"component":true,"usingComponents":{"comp":"./comp","custom-wrapper":"./custom-wrapper"}}',
            true
          );
          assets['custom-wrapper.wxml'] = new RawSource(
            `<import src="./base.wxml" />
  <block wx:for="{{i.cn}}" wx:key="uid">
    <template is="tmpl_0_container" data="{{i:item,l:''}}" />
  </block>`,
            true
          );
          assets['custom-wrapper.json'] = new RawSource(
            '{"component":true,"usingComponents":{"comp":"./comp","custom-wrapper":"./custom-wrapper"}}',
            true
          );

          compilation.chunks.forEach(chunk => {
            if (/^pages\//.test(chunk.name)) {
              const jsonName = chunk.name + '.json';
              const xmlName = chunk.name + '.wxml';
              assets[jsonName] = new RawSource(
                '{"navigationBarTitleText":"首页","usingComponents":{"custom-wrapper":"../../custom-wrapper","comp":"../../comp"}}',
                true
              );
              assets[xmlName] = new RawSource(
                `<import src="../../base.wxml"/>
              <template is="taro_tmpl" data="{{root:root}}" />`,
                true
              );
            }
          });
        }
      );
    });
  }
}
