import dynamic from '@shuvi/app/dynamic'

const DynamicComponent = dynamic(() => import('../../components/nested1'))

export default DynamicComponent
