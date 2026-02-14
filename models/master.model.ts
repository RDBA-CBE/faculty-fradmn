import instance from "@/utils/axios.utils";

const master = {
  // Category APIs
  category_list: (body: any = {}) => {
    let promise = new Promise((resolve, reject) => {
      let url = "job-categories/";
      if (body?.search) url += `?search=${encodeURIComponent(body.search)}`;
      if (body?.ordering)
        url += `${body.search ? "&" : "?"}ordering=${encodeURIComponent(
          body.ordering,
        )}`;
      instance()
        .get(url)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  create_category: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("job-categories/", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  update_category: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .put(`job-categories/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  delete_category: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`job-categories/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  // Job Type APIs
  job_type_list: (body: any = {}) => {
    let promise = new Promise((resolve, reject) => {
      let url = "job-types/";
      if (body?.search) url += `?search=${encodeURIComponent(body.search)}`;
      if (body?.ordering)
        url += `${body.search ? "&" : "?"}ordering=${encodeURIComponent(
          body.ordering,
        )}`;
      instance()
        .get(url)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  create_job_type: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("job-types/", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  update_job_type: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .put(`job-types/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  delete_job_type: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`job-types/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  // Location APIs
  location_list: (body: any = {}) => {
    let promise = new Promise((resolve, reject) => {
      let url = "job-locations/";
      if (body?.search) url += `?search=${encodeURIComponent(body.search)}`;
      if (body?.ordering)
        url += `${body.search ? "&" : "?"}ordering=${encodeURIComponent(
          body.ordering,
        )}`;
      instance()
        .get(url)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  create_location: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("job-locations/", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  update_location: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .put(`job-locations/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  delete_location: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`job-locations/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  // Salary Range APIs
  salary_range_list: (body: any = {}) => {
    let promise = new Promise((resolve, reject) => {
      let url = "salary-ranges/";
      if (body?.search) url += `?search=${encodeURIComponent(body.search)}`;
      if (body?.ordering)
        url += `${body.search ? "&" : "?"}ordering=${encodeURIComponent(
          body.ordering,
        )}`;
      instance()
        .get(url)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  create_salary_range: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("salary-ranges/", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  update_salary_range: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .put(`salary-ranges/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  delete_salary_range: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`salary-ranges/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  // Skill APIs
  skill_list: (body: any = {}) => {
    let promise = new Promise((resolve, reject) => {
      let url = "job-skills";
      if (body?.search) url += `?search=${encodeURIComponent(body.search)}`;
      if (body?.ordering)
        url += `${body.search ? "&" : "?"}ordering=${encodeURIComponent(
          body.ordering,
        )}`;
      instance()
        .get(url)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  create_skill: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("job-skills", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  update_skill: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .put(`job-skills/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  delete_skill: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`job-skills/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  // Tags APIs
  tags_list: (body: any = {}) => {
    let promise = new Promise((resolve, reject) => {
      let url = "job-tags/";
      if (body?.search) url += `?search=${encodeURIComponent(body.search)}`;
      if (body?.ordering)
        url += `${body.search ? "&" : "?"}ordering=${encodeURIComponent(
          body.ordering,
        )}`;
      instance()
        .get(url)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  create_tag: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("job-tags/", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  update_tag: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .put(`job-tags/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  delete_tag: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`job-tags/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  // Application Status APIs
  application_status_list: (body: any = {}) => {
    let promise = new Promise((resolve, reject) => {
      let url = "application-statuses/";
      if (body?.search) url += `?search=${encodeURIComponent(body.search)}`;
      if (body?.ordering)
        url += `${body.search ? "&" : "?"}ordering=${encodeURIComponent(
          body.ordering,
        )}`;
      instance()
        .get(url)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  create_application_status: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("application-statuses/", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  update_application_status: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .put(`application-statuses/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
  delete_application_status: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`application-statuses/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  experience_list: (body, page) => {
    let promise = new Promise((resolve, reject) => {
      let url = `master-experiences/`;
      if (body?.search) url += `?search=${encodeURIComponent(body.search)}`;
      if (body?.ordering)
        url += `${body.search ? "&" : "?"}ordering=${encodeURIComponent(
          body.ordering,
        )}`;

      instance()
        .get(url)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

   create_experience: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("master-experiences/", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  update_experience: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .put(`master-experiences/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  delete_experience: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`master-experiences/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
};

export default master;
