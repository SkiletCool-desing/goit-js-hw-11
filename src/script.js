import { Report } from 'notiflix/build/notiflix-report-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import InfiniteScroll from 'infinite-scroll';
import { fetchImages, PER_PAGE, API_KEY, BASE_URL } from './js/api';
import createMarkup from './js/template/markup';
import refs from './js/refs';

refs.formEl.addEventListener('submit', onSubmitSearch);

let currentPage = 1;
let value = '';
let totalHitsImg = 0;

function onload() {
  currentPage += 1;
  getImage();
}

function onSubmitSearch(e) {
  e.preventDefault();
  value = e.currentTarget.elements.searchQuery.value.trim();
  if (!value) {
    message('Please write correct data!');
    return;
  }

  clearGallery();
  getImage();
}

async function getImage() {
  try {
    const resp = await fetchImages(currentPage, value);
    refs.galleryWrapperEl.insertAdjacentHTML(
      'beforeend',
      createMarkup(resp.hits)
    );
    
    lightbox.refresh();

   
    if (resp.total === 0) {
      message('Please write correct data!');
      return;
    }
    totalHitsImg += resp.hits.length;

    if (totalHitsImg === resp.totalHits || totalHitsImg < 40) {
      refs.spanEl.textContent =
        'Were sorry, but you ve reached the end of search results.';
      return;
    }
    if (totalHitsImg > 40) {
      const { height: cardHeight } =
        refs.galleryWrapperEl.firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }
  } catch (error) {
    Report.failure('404', '');
    console.error(error);
  }
}


const infiniteScroll = new InfiniteScroll(refs.galleryWrapperEl, {
  responseType: 'json',
  history: false,
  status: '.scroll-status'
});

infiniteScroll.on('load', onload);

infiniteScroll.on('error', () => {
  Report.failure('404', '');
});

function message(sms) {
  Report.warning(`Warning!`, `${sms}`);
}
let lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

function clearGallery() {
  totalHitsImg = 0;
  currentPage = 1;
  refs.spanEl.innerHTML = '';
  refs.galleryWrapperEl.innerHTML = '';
}
