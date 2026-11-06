const filters = document.querySelector('.paju-filters');
const areas = document.querySelectorAll('.paju-area');
const count = document.querySelector('#paju-count');
const pins = createMapPins();

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

function createMapPins() {
  const leaflet = window.L;
  if (!leaflet?.markerClusterGroup) return null;

  document.querySelector('#paju-map-panel').hidden = false;
  const map = leaflet.map('paju-map', {scrollWheelZoom: false}).setView([37.8, 126.8], 11);
  leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const group = leaflet.markerClusterGroup({maxClusterRadius: 34}).addTo(map);
  const places = Array.from(document.querySelectorAll('.paju-area [data-point]'), (place) => {
    const name = place.querySelector('h3').textContent;
    const icon = leaflet.divIcon({
      className: 'paju-map-pin',
      html: '<span data-kind="' + place.dataset.kind + '"></span>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -10],
    });
    const marker = leaflet.marker(place.dataset.point.split(',').map(Number), {
      icon,
      title: name,
    });

    const popup = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = name;
    const link = place.querySelector('.stops a').cloneNode(true);
    link.textContent = '네이버 지도·길찾기 ↗';
    popup.append(title, document.createElement('br'), link);
    marker.bindPopup(popup);
    return {place, marker};
  });

  function fit() {
    map.fitBounds(group.getBounds(), {padding: [25, 25], maxZoom: 15});
  }

  group.addLayers(places.map(({marker}) => marker));
  fit();
  return {group, places, fit};
}

for (const photo of document.querySelectorAll('.paju-place-photo img')) {
  const showFallback = () => {
    photo.hidden = true;
    photo.nextElementSibling.hidden = false;
  };
  photo.addEventListener('error', showFallback);
  if (photo.complete && photo.naturalWidth === 0) showFallback();
}
