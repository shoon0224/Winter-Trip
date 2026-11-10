const filters = document.querySelector('.paju-filters');
const areas = document.querySelectorAll('.paju-area');
const count = document.querySelector('#paju-count');
const pins = createMapPins({
  panel: document.querySelector('#paju-map-panel'),
  cards: document.querySelectorAll('.paju-area [data-point]'),
  center: [37.8, 126.8],
});

function showPlaces(kind) {
  let visibleCount = 0;
  for (const area of areas) {
    let areaCount = 0;
    for (const place of area.querySelectorAll('[data-kind]')) {
      place.hidden = kind !== '전체' && place.dataset.kind !== kind;
      if (!place.hidden) areaCount += 1;
    }
    area.querySelector('.grid').hidden = areaCount === 0;
    area.querySelector('.paju-empty').hidden = areaCount > 0;
    visibleCount += areaCount;
  }

  for (const button of filters.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === kind));
  }
  if (pins) {
    pins.group.clearLayers();
    pins.group.addLayers(pins.places.filter(({place}) => !place.hidden).map(({marker}) => marker));
    pins.fit();
  }
  count.textContent = `${visibleCount}곳 · ${kind}`;
}

for (const area of areas) {
  const empty = document.createElement('p');
  empty.className = 'lead paju-empty';
  empty.textContent = '이 권역에는 선택한 유형의 후보가 없어요. 전체 후보나 다른 권역을 둘러보세요.';
  empty.hidden = true;
  area.append(empty);
}

filters.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-filter]');
  if (button) showPlaces(button.dataset.filter);
});
filters.hidden = false;
