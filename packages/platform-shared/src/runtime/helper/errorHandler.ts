import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { getModelManager, errorModel, IPageError } from '../store';

export type Error = {
  code?: number;
  message?: string;
};

export type IErrorHandlerFn = (error?: Error) => void;

export interface IErrorHandler {
  errorHandler: IErrorHandlerFn;
  reset: () => void;
  hasError: () => boolean;
}

export function getErrorHandler(
  modelManager: ReturnType<typeof getModelManager>
): IErrorHandler {
  const errorStore = modelManager.get(errorModel);

  return {
    errorHandler({ code = SHUVI_ERROR_CODE.APP_ERROR, message }: Error = {}) {
      const { hasError } = errorStore.$state();
      if (hasError) {
        return;
      }

      const payload = {
        hasError: true
      } as IPageError;
      payload.errorCode = code ?? SHUVI_ERROR_CODE.APP_ERROR;
      payload.errorDesc = message;
      errorStore.update(payload);
    },
    reset() {
      const { hasError } = errorStore.$state();
      if (hasError) {
        errorStore.reset();
      }
    },
    hasError() {
      const { hasError } = errorStore.$state();
      return hasError;
    }
  };
}
