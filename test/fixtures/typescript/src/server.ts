import {
  GetPageDataFunction,
  HandlePageRequestFunction
} from '@shuvi/runtime/server';

// fixme: GetPageDataFunction is any
export const getPageData: GetPageDataFunction = () => {
  return {};
};

export const handlePageRequest: HandlePageRequestFunction =
  originalHandlePageRequest => {
    return async (req, res) => {
      await originalHandlePageRequest(req, res);
    };
  };
