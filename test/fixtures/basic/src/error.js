import {Link} from '@shuvi/app'
export default ({errorCode, errorDesc})=>{
  return <div style={{color:'red'}}>
    custom error {errorCode}  {errorDesc}
    <br/>
    <Link to="/about">about</Link>
  </div>
}
