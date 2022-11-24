export default function A() {
  return (
    <div>
      <div>
        this is a
      </div>
    </div>
  );
}

export const loader = () => {
  throw new Error('loader error')
}
