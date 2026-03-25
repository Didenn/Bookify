let csrfPromise = null;

export default function ensureCsrf() {
    if (csrfPromise) return csrfPromise;

    csrfPromise = window.axios
        .get('/sanctum/csrf-cookie')
        .then((res) => {
            csrfPromise = null;
            return res;
        })
        .catch((e) => {
            csrfPromise = null;
            throw e;
        });

    return csrfPromise;
}
