import instance from "@/utils/axios.utils";

const instution = {
  list: (page, body) => {
    let promise = new Promise((resolve, reject) => {
      let url = `institutions/?page=${page}`;
      if (body?.search) {
        url += `&search=${encodeURIComponent(body.search)}`;
      }
      if (body?.ordering) {
        url += `&ordering=${encodeURIComponent(body.ordering)}`;
      }
      if (body.created_by) {
        url = url + `&created_by=${body.created_by}`;
      }

      if (body.team == "No") {
        url = url + `&team=${false}`;
      }

      if (body.team == "Yes") {
        url = url + `&team=${true}`;
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
      let url = `institutions/`;
      instance()
        .post(url, data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          console.log("model error", error);
          
          
            reject(error.response?.data?.message || error);
          
        });
    });
    return promise;
  },

  update: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `institutions/${id}/`;

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
      let url = `institutions/${id}/`;

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
      let url = `auth/view_user/${id}`;
      instance()
        .post(url)
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

export default instution;