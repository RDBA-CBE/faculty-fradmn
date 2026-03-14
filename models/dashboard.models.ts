import instance from "@/utils/axios.utils";

const dashboard = {
  list: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `/dashboard/content?period=six_months`;
     
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

export default dashboard;
