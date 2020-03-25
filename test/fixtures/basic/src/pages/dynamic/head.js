import dynamic from '@shuvi/app/dynamic'
import Head from '@shuvi/app/head'

const Test = dynamic({
  loader: async () => {
    // component
    return () => {
      return (
        <div className="dynamic-style">
          <Head>
            <style
              dangerouslySetInnerHTML={{
                __html: `
            .dynamic-style {
              background-color: green;
              height: 200px;
            }
          `,
              }}
            />
          </Head>
          test
        </div>
      )
    }
  },
  ssr: false,
})

export default Test
