import { Link } from '@shuvi/runtime';
import mitt from 'mitt'
export default function A() {
  console.log('mitt', mitt())
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
