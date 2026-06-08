export const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

export const flushPromises = async () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

