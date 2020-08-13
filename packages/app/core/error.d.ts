import { Runtime } from '@shuvi/types';
import { IError } from '@shuvi/core';

interface IErrorProps {
  error: IError;
}

declare const ErrorPage: Runtime.IErrorComponent<React.FC<IErrorProps>, any>;

export default ErrorPage;
