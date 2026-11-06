for (const photo of document.querySelectorAll('.paju-place-photo img')) {
  const showFallback = () => {
    photo.hidden = true;
    photo.nextElementSibling.hidden = false;
  };
  photo.addEventListener('error', showFallback);
  if (photo.complete && photo.naturalWidth === 0) showFallback();
}

for (const gallery of document.querySelectorAll('.paju-place-photo:has(.paju-photo-controls)')) {
  const track = gallery.querySelector('.paju-photo-track');
  const slides = track.querySelectorAll('.paju-photo-slide');
  const controls = gallery.querySelector('.paju-photo-controls');
  const [previous, next] = controls.querySelectorAll('button');
  const counter = controls.querySelector('.paju-photo-count');
  const credit = gallery.querySelector('figcaption a');
  let current = 0;

  function updateSlide(index) {
    current = index;
    const slide = slides[index];
    counter.textContent = `${index + 1} / ${slides.length}`;
    credit.href = slide.href;
    credit.textContent = `사진 · ${slide.dataset.credit} ↗`;
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
  }

  function goTo(index) {
    updateSlide(index);
    track.scrollTo({left: index * track.clientWidth});
  }

  previous.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  track.addEventListener('scroll', () => {
    if (!track.clientWidth) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index >= 0 && index < slides.length && index !== current) updateSlide(index);
  }, {passive: true});

  updateSlide(0);
  controls.hidden = false;
}
