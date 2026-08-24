import instance from "@/utils/axios.utils";

const dashboard = {
  list: (body) => {
    let promise = new Promise((resolve, reject) => {
      // const query = params ? new URLSearchParams(params).toString() : "period=six_months";
      // let url = `/dashboard/content`;
      // if (body?.period) {
      //   url += `?period=${encodeURIComponent(body.period)}`;
      // } else {
      //   if (body?.from) {
      //     url += `&from=${encodeURIComponent(body.from)}`;
      //   }

      //   if (body.to) {
      //     url = url + `&to=${body.to}`;
      //   }
      // }

      let url = `/dashboard/content`;

      if (body?.period) {
        url += `?period=${encodeURIComponent(body.period)}`;
      } else {
        const params = [];

        if (body?.from) {
          params.push(`from=${encodeURIComponent(body.from)}`);
        }

        if (body?.to) {
          params.push(`to=${encodeURIComponent(body.to)}`);
        }

        if (params.length) {
          url += `?${params.join("&")}`;
        }
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

  dashboard: (body) => {
  let promise = new Promise((resolve, reject) => {
    let url = `/dashboard-v2/content`;

    const params = [];

    if (body?.period) {
      params.push(`period=${encodeURIComponent(body.period)}`);
    }

    if (body?.from) {
      params.push(`from=${encodeURIComponent(body.from)}`);
    }

    if (body?.to) {
      params.push(`to=${encodeURIComponent(body.to)}`);
    }

    if (body?.college_id) {
      params.push(`college=${encodeURIComponent(body.college_id)}`);
    }

    if (params.length) {
      url += `?${params.join("&")}`;
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
};

export default dashboard;
