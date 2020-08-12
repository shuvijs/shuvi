import { Runtime } from '@shuvi/types';

interface IErrorProps {
  notFound: boolean;
}

declare const ErrorPage: Runtime.IErrorComponent<React.FC, IErrorProps>;

export default ErrorPage;
