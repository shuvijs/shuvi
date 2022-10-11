export const revalidateInSeconds = 5 * 60;

export const loader = async () => {
  return {
    props: {},
    revalidate: revalidateInSeconds
  };
};

export default function Home({}) {
  return (
    <div>
      <p>Hello World</p>
    </div>
  );
}
