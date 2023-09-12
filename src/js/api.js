import axios from 'axios';

const BASE_URL = `https://pixabay.com/api/`;
const API_KEY = '39018185-f8e358a47676873f1ff74a55c';
const PER_PAGE = 40;

async function fetchImages(page = 1, value) {
  axios.defaults.params = {
    key: API_KEY,
    q: value,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: PER_PAGE,
    page: page,
  };
  const response = await axios.get(BASE_URL);
  return response.data;
}

export { fetchImages, PER_PAGE, BASE_URL, API_KEY };