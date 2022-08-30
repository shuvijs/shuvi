import { Head } from '@shuvi/runtime';
import './globals.css';
import styles from './module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Shuvi App</title>
        <meta name="description" content="Generated by create shuvi app" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to{' '}
          <a href="https://shuvijs.github.io/shuvijs.org">Shuvi.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>src/routes/page.tsx</code>
        </p>

        <div className={styles.grid}>
          <a
            href="https://shuvijs.github.io/shuvijs.org/docs/tutorials"
            className={styles.card}
          >
            <h2>Tutorials &rarr;</h2>
            <p>Create your first app!</p>
          </a>

          <a
            href="https://shuvijs.github.io/shuvijs.org/docs/guide"
            className={styles.card}
          >
            <h2>Guide &rarr;</h2>
            <p>Learn about Shuvi.js more.</p>
          </a>

          <a
            href="https://shuvijs.github.io/shuvijs.org/docs/api-reference"
            className={styles.card}
          >
            <h2>API Reference &rarr;</h2>
            <p>API reference.</p>
          </a>

          <a
            href="https://shuvijs.github.io/shuvijs.org/docs/playground"
            className={styles.card}
          >
            <h2>Playground &rarr;</h2>
            <p>Try it without installing anything!</p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://shuvijs.github.io/shuvijs.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Shuvi.js
        </a>
      </footer>
    </div>
  );
}
