import dynamic from '@shuvi/app/services/dynamic';
import Welcome from '../components/welcome';

const Welcome2 = dynamic(() => import('../components/welcome'));

export default () => (
  <div>
    <Welcome name="normal" />
    <Welcome2 name="dynamic" />
  </div>
);
