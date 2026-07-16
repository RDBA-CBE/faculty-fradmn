import instance from '@/utils/axios.utils';
import { IoMdBody } from 'react-icons/io';

const notification = {
   list: (body) => {
    return new Promise((resolve, reject) => {
        let url = "notifications";
        const query = [];

        if (body?.college_id) {
            query.push(`college_id=${body.college_id}`);
        }

        if (body?.institution_id) {
            query.push(`institution_id=${body.institution_id}`);
        }

        if (query.length) {
            url += `?${query.join("&")}`;
        }

        instance()
            .get(url)
            .then((res) => resolve(res.data))
            .catch((error) => {
                reject(error.response?.message || error);
            });
    });
},

    notification_view: (body:any) => {
            let promise = new Promise((resolve, reject) => {
                let url = `notifications/view/`;
                const query = [];

                if (body?.college_id) {
                    query.push(`college_id=${body.college_id}`);
                }

                if (body?.institution_id) {
                    query.push(`institution_id=${body.institution_id}`);
                }

                if (query.length) {
                    url += `?${query.join("&")}`;
                }

                instance()
                    .put(url, body)
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

    mark_view: (body:any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `notifications/applications/${body.user_id}/view/`;
            instance()
                .put(url, body)
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
    }
}

export default notification;
