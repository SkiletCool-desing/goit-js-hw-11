import { Report } from 'notiflix/build/notiflix-report-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages, PER_PAGE, API_KEY, BASE_URL } from './js/api';
import createMarkup from './js/template/markup';
import refs from './js/refs';

document.addEventListener('DOMContentLoaded', () => {
  refs.formEl.addEventListener('submit', onSubmitSearch);

  let currentPage = 1;
  let value = '';
  let totalHitsImg = 0;

  let lightbox;

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
    if (!value) {
      return;
    }
    try {
      const resp = await fetchImages(currentPage, value);
      refs.galleryWrapperEl.insertAdjacentHTML(
        'beforeend',
        createMarkup(resp.hits)
      );

      if (!lightbox) {
        lightbox = new SimpleLightbox('.gallery a', {
          captions: true,
          captionsData: 'alt',
          captionPosition: 'bottom',
          captionDelay: 250,
        });
      } else {
        lightbox.refresh();
      }

      if (resp.total === 0) {
        message('Please write correct data!');
        return;
      }
      totalHitsImg += resp.hits.length;

      if (totalHitsImg === resp.totalHits || totalHitsImg < 40) {
        refs.spanEl.textContent =
          "We're sorry, but you've reached the end of search results.";
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

  function handleIntersection(entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        getImage();
      }
    });
  }

  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5,
  };

  const intersectionObserver = new IntersectionObserver(
    handleIntersection,
    options
  );

  const infinite = new IntersectionObserver(([entry], observer) => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      onLoadMore();
    }
  });

  // console.log(refs.bottomElement);
  intersectionObserver.observe(refs.bottomElement);

  function message(sms) {
    Report.warning('Warning!', `${sms}`);
  }

  function clearGallery() {
    totalHitsImg = 0;
    currentPage = 1;
    refs.spanEl.innerHTML = '';
    refs.galleryWrapperEl.innerHTML = '';
  }
});
