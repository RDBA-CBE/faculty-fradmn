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

      if (body.role) {
        url = url + `&role=${body.role}`;
      }
      if (body?.search) {
        url = url + `&search=${body.search}`;
      }
      if (body?.college_id) {
        url = url + `&college=${body.college_id}`;
      }

      if (body?.department_id) {
        url = url + `&department=${body.department_id}`;
      }

      if (body?.institution_id) {
        url = url + `&institution=${body.institution_id}`;
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
        url = url + `&location=${body.location}`;
      }

      if (body?.start_date) {
        url = url + `&date_posted_after=${body.start_date}`;
      }
      if (body?.end_date) {
        url = url + `&date_posted_before=${body.end_date}`;
      }
      if (body?.status) {
        url = url + `&status=${body.status}`;
      }
      if (body?.priority) {
        url = url + `&priority=${body.priority}`;
      }
      if (body?.job_type) {
        url = url + `&job_type=${body.job_type}`;
      }
      if (body?.salary_range) {
        url = url + `&salary_range=${body.salary_range}`;
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
        .post(url, data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
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

  log_list: (page = 1) => {
    let promise = new Promise((resolve, reject) => {
      let url = `activity-logs/`;
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

  create_log: (data) => {
    let promise = new Promise((resolve, reject) => {
      let url = `activity-logs/`;
      instance()
        .post(url, data)
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

  job_category: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `job-categories/`;
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
  job_locations: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `job-locations/`;
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
  job_priority: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `job-priorities/`;
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
  job_status: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `job-statuses/`;
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
  job_types: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `job-types/`;
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
  job_salary_ranges: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `salary-ranges/`;
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

  job_skills: (page = 1) => {
    let promise = new Promise((resolve, reject) => {
      let url = `job-skills`;
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
  job_tags: (page = 1) => {
    let promise = new Promise((resolve, reject) => {
      let url = `job-tags/`;
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