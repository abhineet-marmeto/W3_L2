const apiKey = 'EKitW5K2GiRcWW5hik6qAqEfIRHCdSj7PD9AaG87wMpiry1nSftbtDqQ';
let favorites = [];

async function fetchImages(query, perPage = 5) {
  const url = `https://api.pexels.com/v1/search?query=${query}&per_page=${perPage}`;
  const response = await fetch(url, {
    headers: {
      Authorization: apiKey
    }
  });
  return response.json();
}

function toggleFavorite(image) {
  const index = favorites.findIndex(fav => fav.id === image.id);
  if (index !== -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(image);
  }
  displayFavoriteImages();
}

function isFavorite(imageId) {
  return favorites.some(fav => fav.id === imageId);
}

async function displayFeaturedImage(query) {
  const data = await fetchImages(query, 1);
  const image = data.photos[0];

  const featuredSection = document.getElementById('featured-image');
  featuredSection.innerHTML = `
        <div class="featured-details">
            <h2>${image.alt}</h2>
            <p>${image.photographer}</p>
            <button>EXPLORE MORE</button>
        </div>
        <img src="${image.src.large}" alt="${image.alt}">
    `;
}

async function displaySimilarImages(query) {
  const data = await fetchImages(query, 10);

  const similarContainer = document.getElementById('similar-images');
  similarContainer.innerHTML = '';

  data.photos.forEach(image => {
    const isFav = isFavorite(image.id);
    const imageElement = document.createElement('div');
    imageElement.className = "image-container";
    imageElement.innerHTML = `
            <img src="${image.src.medium}" alt="${image.alt}">
              <i class="heart-icon" data-id="${image.id}">${isFav ? '❤️' : '&#9825;'}</i>
              `;
    imageElement.querySelector('.heart-icon').addEventListener('click', () => {
      toggleFavorite(image);
      displaySimilarImages(query); // Update the similar images to reflect the favorite status
    });
    similarContainer.appendChild(imageElement);
  });
}

function displayFavoriteImages() {
  const favoriteContainer = document.getElementById('favorite-images');
  favoriteContainer.innerHTML = '';

  favorites.forEach(image => {
    const imageElement = document.createElement('div');
    imageElement.className = "image-container";
    imageElement.innerHTML = `
                  <img src="${image.src.medium}" alt="${image.alt}">
                  <i class="heart-icon" data-id="${image.id}">❤️</i>
              `;
    imageElement.querySelector('.heart-icon').addEventListener('click', () => {
      toggleFavorite(image);
      displayFavoriteImages(); // Update the favorites section to reflect the removal
      displaySimilarImages(document.getElementById('search-input').value); // Update similar images
    });
    favoriteContainer.appendChild(imageElement);
  });
}

function initCarousel(containerId, prevButtonClass, nextButtonClass) {
  const container = document.getElementById(containerId);
  const prevButton = document.querySelector(prevButtonClass);
  const nextButton = document.querySelector(nextButtonClass);

  let scrollAmount = 0;
  const scrollStep = 250;

  prevButton.addEventListener('click', () => {
    container.scrollTo({
      top: 0,
      left: (scrollAmount -= scrollStep),
      behavior: 'smooth'
    });
    if (scrollAmount < 0) {
      scrollAmount = 0;
    }
  });

  nextButton.addEventListener('click', () => {
    if (scrollAmount <= container.scrollWidth - container.clientWidth) {
      container.scrollTo({
        top: 0,
        left: (scrollAmount += scrollStep),
        behavior: 'smooth'
      });
    }
  });
}

document.getElementById('search-button').addEventListener('click', () => {
  const query = document.getElementById('search-input').value;
  displayFeaturedImage(query);
  displaySimilarImages(query);
});

document.getElementById('search-input').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    const query = event.target.value;
    displayFeaturedImage(query);
    displaySimilarImages(query);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  displayFeaturedImage('nature'); // Load a default image on load
  displaySimilarImages('nature');

  initCarousel('similar-images', '.carousel-prev', '.carousel-next');
  initCarousel('favorite-images', '.carousel-prev', '.carousel-next');
});
