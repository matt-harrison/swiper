let axios = require('axios');

import { key } from '@/api-key';

export default {
  getGenres: () => {
    return axios.get('https://api.themoviedb.org/3/genre/movie/list', {
      params: {
        api_key: key
      }
    });
  },
  getMovies: (params) => {
    params.api_key = key;

    return axios.get('https://api.themoviedb.org/3/discover/movie', {
      params
    });
  }
};
