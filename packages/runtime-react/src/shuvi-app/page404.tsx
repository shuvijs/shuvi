import { NOT_FOUND_ERROR_MESSAGE } from '@shuvi/shared/lib/constants';
import { IRouteComponent } from '@shuvi/types/src/runtime';

const Page404: IRouteComponent<React.FC, void> = () => {
  return null;
};

Page404.getInitialProps = ({ appContext }) => {
  appContext.error(new Error(NOT_FOUND_ERROR_MESSAGE));
};

export default Page404;
