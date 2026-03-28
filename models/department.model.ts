import instance from "@/utils/axios.utils";

const department = {
  list: (page, body) => {
    let promise = new Promise((resolve, reject) => {
      let url = `departments/?page=${page}`;

      if (body?.search) {
        url += `&search=${encodeURIComponent(body.search)}`;
      }

      if (body?.pagination == "No") {
        url += `&pagination=${encodeURIComponent(false)}`;
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

      if (body?.job_id) {
        url += `&job_ids=${encodeURIComponent(body?.job_id)}`;
      }

      if (body?.is_approved == "Yes") {
        url += `&is_approved=${encodeURIComponent(true)}`;
      }

      if (body?.is_approved == "No") {
        url += `&is_approved=${encodeURIComponent(false)}`;
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

  create_new: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `departments/from-master/`;
      instance()
        .post(url, data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          console.log("✌️error --->", error);
          if (error.response) {
            reject(error.response);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  create_dept_extra_data_each_college: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `department-extras/`;
      instance()
        .post(url, data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          console.log("✌️error --->", error);
          if (error.response) {
            reject(error.response);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  update_dept_extra_data_each_college: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `department-extras/${id}/`;

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

  delete_dept_extra_data_each_college: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `department-extras/${id}/`;

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

  get_dept_extra_data_each_college: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `department-extras/${id}/`;
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
