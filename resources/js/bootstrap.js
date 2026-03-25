import axios from 'axios';
window.axios = axios;

window.axios.defaults.baseURL = window.location.origin;
window.axios.defaults.withCredentials = true;
window.axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
window.axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
