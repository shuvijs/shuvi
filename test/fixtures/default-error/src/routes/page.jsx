import { Link } from '@shuvi/runtime'
export default function Index() {
  return <div>
    <div>
      <Link to='/render-error'>To /render-error</Link>
    </div>
    <div>
      <Link to='/loader-error'>To /loader-error</Link>
    </div>
  </div>
}
