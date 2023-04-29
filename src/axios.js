import axios from 'axios';
import { API_KEY } from './constants';

export async function getPhoto(page = 1, searchValue = '') {
  const response = await axios.get(
    `https://pixabay.com/api/?key=${API_KEY}&q=${searchValue}&image_type=photo&page=${page}&orientation=horizontal&safesearch=true&per_page=39`
  );
  return response.data;
}
