function Index() {
  return <div>index</div>
}

Index.getInitialProps = ctx => {
  ctx.error(404,"page not found")
}

export default Index
