import instance from "@/utils/axios.utils";

const department = {
  list: (page, body) => {
    let promise = new Promise((resolve, reject) => {
      let url = `departments/?page=${page}`;

      if (body?.search) {
        url += `&search=${encodeURIComponent(body.search)}`;
      }
      if (body?.college) {
        url += `&college=${encodeURIComponent(body.college)}`;
      }
      if (body?.ordering) {
        url += `&ordering=${encodeURIComponent(body.ordering)}`;
      }
      if (body?.institution) {
        url += `&institution=${encodeURIComponent(body.institution)}`;
      }

      if (body?.created_by) {
        url += `&created_by=${encodeURIComponent(body.created_by)}`;
      }
      if (body?.team == "Yes") {
        url += `&team=${encodeURIComponent(true)}`;
      }
      if (body?.team == "No") {
        url += `&team=${encodeURIComponent(false)}`;
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
      let url = `departments/`;
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
      let url = `departments/${id}/`;

      instance()
        .patch(url, data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  delete: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `departments/${id}/`;

      instance()
        .delete(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.data.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  details: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `departments/${id}/`;
      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.data.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  

  
};

export default department;