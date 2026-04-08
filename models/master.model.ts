import instance from "@/utils/axios.utils";

const master = {
  // Category APIs
  category_list: (body: any = {}, page = 1) => {
    let promise = new Promise((resolve, reject) => {
      let url = `job-categories/?page=${page}`;
      if (body?.search) url += `&search=${encodeURIComponent(body.search)}`;
      if (body?.ordering)
        url += `&ordering=${encodeURIComponent(body.ordering)}`;
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
          body.ordering
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
  location_list: (page = 1, body: any = {}) => {
    let promise = new Promise((resolve, reject) => {
      let url = `job-locations/?page=${page}`;
      if (body?.search) url += `&search=${encodeURIComponent(body.search)}`;
      if (body?.ordering)
        url += `&ordering=${encodeURIComponent(body.ordering)}`;
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
          body.ordering
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
          body.ordering
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
          body.ordering
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
      let hasQuery = false;
      
      if (body?.search) {
        url += `${hasQuery ? "&" : "?"}search=${encodeURIComponent(body.search)}`;
        hasQuery = true;
      }
      
      if (body?.ordering) {
        url += `${hasQuery ? "&" : "?"}ordering=${encodeURIComponent(body.ordering)}`;
        hasQuery = true;
      }
      
      if (body?.rexclude_applied_interview === "Yes") {
        url += `${hasQuery ? "&" : "?"}rexclude_applied_interview=true`;
        hasQuery = true;
      }
        
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
          body.ordering
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

  create_priority: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("job-priorities/", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  update_priority: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .put(`job-priorities/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  delete_priority: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`job-priorities/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  // College Type

  college_type: (page = 1, body) => {
    let promise = new Promise((resolve, reject) => {
      let url = `college-types/?page=${page}`;
      if (body?.search) url += `&search=${encodeURIComponent(body.search)}`;
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

  create_college_type: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("college-types/", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  update_college_type: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .put(`college-types/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  delete_college_type: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`college-types/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  // NAAC Accereditation

  NAAC_Accereditation: (page = 1, body) => {
    let promise = new Promise((resolve, reject) => {
      let url = `naac-accreditations/?page=1`;
      if (body?.search) url += `&search=${encodeURIComponent(body.search)}`;
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

  create_NAAC_Accereditation: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("naac-accreditations/", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  update_NAAC_Accereditation: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .put(`naac-accreditations/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  delete_NAAC_Accereditation: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`naac-accreditations/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  // NIRF Band

  NIRF_Band: (page = 1, body) => {
    let promise = new Promise((resolve, reject) => {
      let url = `nirf-bands/?page=1`;
      if (body?.search) url += `&search=${encodeURIComponent(body.search)}`;
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

  create_NIRF_Band: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("nirf-bands/", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  update_NIRF_Band: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .put(`nirf-bands/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  delete_NIRF_Band: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`nirf-bands/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  // NIRF Category

  NIRF_Category: (page = 1, body) => {
    let promise = new Promise((resolve, reject) => {
      let url = `nirf-categories/?page=1`;
      if (body?.search) url += `&search=${encodeURIComponent(body.search)}`;
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

  create_NIRF_Category: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("nirf-categories/", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  update_NIRF_Category: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .put(`nirf-categories/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  delete_NIRF_Category: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`nirf-categories/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  panel_list: (body, page = 1) => {
    let promise = new Promise((resolve, reject) => {
      let url = `interview-panels/?page=${page}`;
      if (body?.search) url += `&search=${encodeURIComponent(body.search)}`;
      if (body?.department_id) url += `&department_id=${body.department_id}`;
      if (body?.college_id) url += `&college_id=${body.college_id}`;
      if (body?.institution_id) url += `&institution_id=${body.institution_id}`;


      


      

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

  create_panel: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("interview-panels/", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  update_panel: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .patch(`interview-panels/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  delete_panel: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`interview-panels/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  dept_list: (body, page = 1) => {
    let promise = new Promise((resolve, reject) => {
      let url = `department-masters/?page=${page}`;

      if (body?.search) url += `&search=${encodeURIComponent(body.search)}`;
      if (body?.pagination === "No") url += `&pagination=false`;
      if (body?.pagination === "Yes") url += `&pagination=true`;

      if (body?.department_id) url += `&department_id=${body.department_id}`;
      if (body?.ordering) url += `&ordering=${body.ordering}`;
      if (body?.is_approved == "Yes") url += `&is_approved=${true}`;
      if (body?.job_category_id)
        url += `&job_category_id=${body?.job_category_id}`;

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

  create_dept: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("department-masters/", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  update_dept: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .patch(`department-masters/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  delete_dept: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`department-masters/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  role_list: (body, page = 1) => {
    let promise = new Promise((resolve, reject) => {
      let url = `job-roles/?page=${page}`;
      if (body?.search) url += `&search=${encodeURIComponent(body.search)}`;
      if (body?.department_id) url += `&department_id=${body.department_id}`;
      if (body?.ordering) url += `&ordering=${body.ordering}`;

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

  create_role: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("job-roles/", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  update_role: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .patch(`job-roles/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  delete_role: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`job-roles/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  // Additional Academic Responsibilities APIs
  additional_academic_responsibilities_list: (body: any = {}, page = 1) => {
    let promise = new Promise((resolve, reject) => {
      let url = `additional-academic-responsibilities/?page=${page}`;
      if (body?.search) url += `&search=${encodeURIComponent(body.search)}`;
      if (body?.pagination == "No") url += `&pagination=${encodeURIComponent(false)}`;

      if (body?.ordering)
        url += `&ordering=${encodeURIComponent(body.ordering)}`;
      instance()
        .get(url)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  create_additional_academic_responsibility: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post("additional-academic-responsibilities/", data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  update_additional_academic_responsibility: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .patch(`additional-academic-responsibilities/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },

  delete_additional_academic_responsibility: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`additional-academic-responsibilities/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => reject(error.response || error));
    });
    return promise;
  },
};

export default master;
