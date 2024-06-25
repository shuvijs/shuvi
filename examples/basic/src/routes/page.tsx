import styles from './style.css';
function con(a: boolean) {
  console.log(a);
}
const Home = () => {
  con(1)
  return (
    <div className={styles.hello}>
      <p>Hello World</p>
    </div>
  );
};

export default Home;
