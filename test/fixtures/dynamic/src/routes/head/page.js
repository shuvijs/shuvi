import { Head, dynamic } from '@shuvi/runtime';

const Test = dynamic({
  loader: async () => {
    // component
    return () => {
      return (
        <div id="head">
          <Head>
            <style
              id="dynamic-style"
              dangerouslySetInnerHTML={{
                __html: `
            .dynamic-style {
              background-color: green;
              height: 200px;
            }
          `
              }}
            />
          </Head>
          test
        </div>
      );
    };
  },
  ssr: false
});

export default Test;
