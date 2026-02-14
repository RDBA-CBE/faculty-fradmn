import instance from "@/utils/axios.utils";

const application = {
  list: (page, body) => {
console.log('✌️bodssssy --->', body);
    let promise = new Promise((resolve, reject) => {
      let url = `applications/?page=${page}`;

      if (body?.search) {
        url += `&search=${encodeURIComponent(body.search)}`;
      }
      if (body?.jobId) {
        url += `&job=${encodeURIComponent(body.jobId)}`;
      }
      if (body?.ordering) {
        url += `&ordering=${encodeURIComponent(body.ordering)}`;
      }

      if (body.role) {
        url = url + `&role=${body.role}`;
      }
      if (body?.search) {
        url = url + `&search=${body.search}`;
      }
      if (body?.college) {
        url = url + `&college=${body.college}`;
      }

      if (body?.department) {
        url = url + `&department=${body.department}`;
      }

      if (body?.institution) {
        url = url + `&institution=${body.institution}`;
      }

      if (body?.created_by) {
        url = url + `&created_by=${body.created_by}`;
      }

      if (body?.team == "No") {
        url = url + `&team=${false}`;
      }

      if (body?.team == "Yes") {
        url = url + `&team=${true}`;
      }
      if (body?.category) {
        url = url + `&category=${body.category}`;
      }
      if (body?.location) {
        url = url + `&location_id=${body.location}`;
      }

      if (body?.start_date) {
        url = url + `&date_posted_after=${body.start_date}`;
      }
      if (body?.end_date) {
        url = url + `&date_posted_before=${body.end_date}`;
      }
      if (body?.status) {
        url = url + `&application_status_id=${body.status}`;
      }
      if (body?.priority) {
        url = url + `&priority=${body.priority}`;
      }
      if (body?.job_type) {
        url = url + `&job_type=${body.job_type}`;
      }
      if (body?.salary_range) {
        url = url + `&salary_range_id=${body.salary_range}`;
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
      let url = `applications/`;
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
      let url = `applications/${id}`;

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
      let url = `applications/${id}`;

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
      let url = `applications/${id}`;
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

export default application;