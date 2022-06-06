export const waitForResponseChange = async <T>(
  requestMethod: () => Promise<T>,
  originContent: T,
  timeout: number = 3000
) => {
  const startTime = Date.now();
  while (true) {
    const currentTime = Date.now();
    if (currentTime - startTime > timeout) {
      throw new Error('超时了！');
    }

    const result = await requestMethod();
    if (result !== originContent) {
      return result;
    }
  }
};
