import { IErrorComponent } from '@shuvi/types/src/runtime';

interface IErrorProps {
  statusCode: number;
}

declare const ErrorPage: IErrorComponent<React.FC, IErrorProps>;

export default ErrorPage;
