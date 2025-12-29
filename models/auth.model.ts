import instance from "@/utils/axios.utils";

const auth = {
  login: (body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `authentication/login/`;
      instance()
        .post(url, body)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  singup: (body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `register/`;
      instance()
        .post(url, body)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  change_password: (body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `register/`;
      instance()
        .post(url, body)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  forget_password: (body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `register/`;
      instance()
        .post(url, body)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  logout: (body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `authentication/logout/`;
      instance()
        .post(url, body)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },
};

export default auth;
