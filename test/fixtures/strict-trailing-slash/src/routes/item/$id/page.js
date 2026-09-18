import { useParams } from '@shuvi/runtime';

export default function Page() {
  const { id } = useParams();
  return <div id="item-id">{id}</div>;
}
