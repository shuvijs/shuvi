import { Head } from '@shuvi/app';

const style = {
  container: {
    color: '#000',
    background: '#fff',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  error: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  errorCode: {
    borderRight: '1px solid rgba(0, 0, 0, 0.3)',
    paddingRight: '20px',
    marginRight: '20px',
    fontSize: '24px',
    fontWeight: 500
  },
  errorDesc: { fontSize: '16px', lineHeight: '1' }
} as const;

export default function Page404() {
  return (
    <div style={style.container}>
      <Head>
        <title>404: Page not found</title>
      </Head>

      <div style={style.error}>
        <div style={style.errorCode}>404</div>
        <div style={style.errorDesc}>This page could not be found.</div>
      </div>
    </div>
  );
}
