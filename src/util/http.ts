import needle from "needle";

const defaultHeaders = {
    "accept": "application/json",
    "Content-Type": "application/json",
    "Accept-Encoding": "gzip",
};

export const get = async function (url: string, headers?: any) {

    let res = await needle("get",
        url,
        {
            headers: Object.assign(defaultHeaders, headers || {})
        }
    );

    return res;
};

export const post = async function (url: string, requestData: any, headers?: any) {

    let res = await needle("post",
        url,
        requestData,
        {
            headers: Object.assign(defaultHeaders, headers || {})
        }
    );

    return res;
};

export const put = async function (url: string, requestData: any, headers?: any) {

    let res = await needle("put",
        url,
        requestData,
        {
            headers: Object.assign(defaultHeaders, headers || {})
        }
    );

    return res;
};

export const patch = async function (url: string, requestData: any, headers?: any) {

    let res = await needle("patch",
        url,
        requestData,
        {
            headers: Object.assign(defaultHeaders, headers || {})
        }
    );

    return res;
};