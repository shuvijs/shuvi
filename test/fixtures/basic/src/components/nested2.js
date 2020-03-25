import dynamic from '@shuvi/app/dynamic'

const BrowserLoaded = dynamic(async () => () => <div>Browser hydrated</div>, {
  ssr: false,
})

export default () => (
  <div>
    <div>Nested 2</div>
    <BrowserLoaded />
  </div>
)
