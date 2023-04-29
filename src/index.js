import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { getPhoto } from './axios';
import { pageConst } from './constants';

const refs = {
  formEl: document.querySelector('#search-form'),
  galleryEl: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const lightbox = new SimpleLightbox('.gallery a', {
  scrollZoom: false,
  captionDelay: 250,
  overlayOpacity: 0.75,
});

refs.formEl.addEventListener('submit', onFormElSubmit);

async function onFormElSubmit(evt) {
  try {
    evt.preventDefault();
    pageConst.searchValue = evt.target[0].value;
    if (!evt.target[0].value.trim()) {
      return;
    }
    refs.loadMoreBtn.classList.add('hidden');
    pageConst.page = 1;
    const response = await getPhoto(pageConst.page, pageConst.searchValue);

    if (response.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    Notify.info(`Total found ${response.totalHits}`);
    pageConst.maxPages = Math.ceil(response.totalHits / 39);
    clearGalleryContainer();
    refs.galleryEl.insertAdjacentHTML(
      'beforeend',
      galleryContainerMarkupMaker(response.hits)
    );
    lightbox.refresh();
    if (pageConst.maxPages > pageConst.page) {
      addLoadBtn();
    }
    refs.formEl.reset();
  } catch (e) {
    Notify.failure(`Sorry. ${e.message}. Please try again later`);
  }
}

async function onClickLoadMore(evt) {
  try {
    evt.preventDefault();
    pageConst.page += 1;
    removeLoadBtn();
    const response = await getPhoto(pageConst.page, pageConst.searchValue);

    if (response.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    refs.galleryEl.insertAdjacentHTML(
      'beforeend',
      galleryContainerMarkupMaker(response.hits)
    );
    lightbox.refresh();

    if (pageConst.maxPages !== pageConst.page) {
      addLoadBtn();
    }
  } catch (e) {
    Notify.failure(`Sorry. ${e.message}. Please try again later`);
  }
}

function galleryContainerMarkupMaker(gallery) {
  return gallery
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="gallery__item">
  <a href="${largeImageURL}"><img class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy"/></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b> ${likes}
    </p>
    <p class="info-item">
      <b>Views</b> ${views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${downloads}
    </p>
  </div>
</div>`
    )
    .join('');
}

function clearGalleryContainer() {
  refs.galleryEl.innerHTML = '';
}
function removeLoadBtn() {
  refs.loadMoreBtn.classList.add('hidden');
  refs.loadMoreBtn.removeEventListener('click', onClickLoadMore);
}
function addLoadBtn() {
  refs.loadMoreBtn.classList.remove('hidden');
  refs.loadMoreBtn.addEventListener('click', onClickLoadMore);
}
