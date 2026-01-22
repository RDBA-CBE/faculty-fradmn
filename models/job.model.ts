import instance from "@/utils/axios.utils";

const job = {
  list: (page, body) => {
    let promise = new Promise((resolve, reject) => {
      let url = `jobs/?page=${page}`;
      if (body?.search) {
        url += `&search=${encodeURIComponent(body.search)}`;
      }
      if (body?.ordering) {
        url += `&ordering=${encodeURIComponent(body.ordering)}`;
      }
      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  create: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `jobs/`;
      instance()
        .post(url, data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  update: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `jobs/${id}/`;
      instance()
        .patch(url, data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  delete: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `jobs/${id}/`;
      instance()
        .delete(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  details: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `jobs/${id}`;
      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },
};

export default job;