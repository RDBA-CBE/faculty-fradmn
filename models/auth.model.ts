import instance from "@/utils/axios.utils";

const auth = {
  login: (body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/login/`;
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

  profile: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/profile/`;
      instance()
        .get(url)
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

  userList: (page: any, body = {} as any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `users/?page=${page}`;
      if (body.role) {
        url = url + `&role=${body.role}`;
      }
      if (body?.search) {
        url = url + `&search=${body.search}`;
      }
      instance()
        .get(url)
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

  createUser: (body = {} as any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `users/`;
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

  updateUser: (id: any, data = {} as any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `users/${id}/`;
      instance()
        .patch(url, data)
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

  deleteUser: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `users/${id}/`;
      instance()
        .delete(url)
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
      let url = `auth/logout/`;
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
