import axios from 'axios';

const api = axios.create({
  baseURL: 'https://myamazonproject.duckdns.org',
});

export default api;