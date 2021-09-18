import {
  publicApis,
  promiseApis,
  synchronizedApis,
  otherApis
} from './apis-list';

declare const bn: any;
const noop = () => {};

function processApis(taro: any) {
  const apis = [
    ...publicApis,
    ...promiseApis,
    ...synchronizedApis,
    ...otherApis
  ];
  apis.forEach(key => {
    console.info(`registering function ${key}`);

    if (key === 'request') {
      taro.request = (option: any) => {
        console.log(`call ${key} here with ${option.data}, ${option.url}`);
        const { data, header, success = noop, fail = noop, ...rest } = option;
        const req = {
          body: data,
          headers: header,
          ...rest
        };

        const res = bn.request(req);

        const requestTask = res.then(
          (res: any) => {
            return res.text().then((data: any) => {
              let dataTxt = data;

              if (option.dataType && option.dataType.toLowerCase() === 'json') {
                dataTxt = JSON.parse(data);
              }
              success({
                data: dataTxt,
                statusCode: res.status,
                header: res.headers
              });
              return {
                data: dataTxt,
                statusCode: res.status,
                header: res.headers
              };
            });
          },
          (err: any) => {
            fail(err);
            return { errMsg: err };
          }
        );

        return requestTask;
      };
    } else if (promiseApis.has(key)) {
      // Need to convert APIs into Promise version
      taro[key] = (options: any) => {
        return new Promise((resolve, reject) => {
          bn[key]
            .apply(bn, [options])
            .then((res: any) => {
              if (options?.success) {
                options.success(res);
              }
              resolve(res);
            })
            .catch((error: any) => {
              if (options?.fail) {
                options.fail(error);
              }
              reject(error);
            })
            .finally((res: any) => {
              if (options?.complete) {
                options.complete(res);
              }
            });
        });
      };
    } else {
      taro[key] = (...args: any[]) => {
        console.log(`call ${key} here with ${args}`);
        return bn[key].apply(bn, args);
      };
    }
  });
}

export function initNativeApi(taro: any) {
  processApis(taro);
}
