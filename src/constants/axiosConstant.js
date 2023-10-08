import axios from "axios";


const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_DEVELOPMENT_ENVIRONMENT_API_URL,
});
axiosInstance.defaults.headers['app-version'] = '1.0';

export default axiosInstance;
