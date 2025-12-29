import instance from "@/utils/axios.utils";

const properties = {
  list: (page, body) => {
    let promise = new Promise((resolve, reject) => {
      
      let url = `properties?page=${page}`;

      if (body?.is_approved == "No") {
        url += `&is_approved=${encodeURIComponent(false)}`;
      }

      if (body?.is_approved == "Yes") {
        url += `&is_approved=${encodeURIComponent(true)}`;
      }

      if (body?.group){
        url += `&group=${body?.group}`;
      }

      if (body?.userId){
        url += `&created_by=${body?.userId}`;
      }

      if (body?.assigned_to_developer) {
        url += `&assigned_to_developer=${encodeURIComponent(body?.assigned_to_developer)}`;
      }

      if (body?.assigned_to_agent) {
        url += `&assigned_to_agent=${encodeURIComponent(body?.assigned_to_agent)}`;
      }

      if (body?.created_by) {
        url += `&created_by=${encodeURIComponent(body?.created_by)}`;
      }

      if (body?.assigned_to) {
        url += `&assigned_to=${encodeURIComponent(body?.assigned_to)}`;
      }

      if (body?.search) {
        url += `&search=${body?.search}`;
      }

      if (body?.property_type) {
        url += `&property_type=${body?.property_type}`;
      }

      if (body?.listing_type) {
        url += `&listing_type=${body?.listing_type}`;
      }

      if (body?.status) {
        url += `&status=${body?.status}`;
      }

      if (body?.developer) {
        url += `&developer=${body?.developer}`;
      }

      if (body?.agent) {
        url += `&agent=${body?.agent}`;
      }

      instance()
        .get(url, body)
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
      let url = `properties/`;
      const config = {
        headers: {
          "Content-Type": "multipart/form-data; charset=utf-8;",
        },
      };
      instance()
        .post(url, data, config)
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

  update: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `properties/${id}/`;
      const config = {
        headers: {
          "Content-Type": "multipart/form-data; charset=utf-8;",
        },
      };
      instance()
        .patch(url, data, config)
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
      let url = `properties/${id}/`;

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
      let url = `properties/${id}/`;

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

  uploadFile: (file: any) => {
    let promise = new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      let url = "/hdd/upload_file";
      const config = {
        headers: {
          "Content-Type": "multipart/form-data; charset=utf-8;",
        },
      };
      instance()
        .post(url, formData, config)
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

export default properties;
