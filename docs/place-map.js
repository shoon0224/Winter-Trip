function createMapPins({panel, cards, center}) {
  const leaflet = window.L;
  if (!leaflet?.markerClusterGroup) return null;

  panel.hidden = false;
  const map = leaflet.map(panel.querySelector('#paju-map'), {scrollWheelZoom: false}).setView(center, 11);
  leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const group = leaflet.markerClusterGroup({maxClusterRadius: 34}).addTo(map);
  const places = Array.from(cards, (place) => {
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
