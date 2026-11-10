(() => {
  const areas = [...document.querySelectorAll('.gn-main .paju-area')].filter(area => area.id !== 'stay');
  const cards = areas.flatMap(area => [...area.querySelectorAll('[data-point]')]);
  const hotel = document.querySelector('#hotel');
  const pins = createMapPins({
    panel: document.querySelector('#paju-map-panel'),
    cards: [hotel, ...cards],
    center: hotel.dataset.point.split(',').map(Number),
  });
  const filters = document.querySelector('.gn-filters');
  const count = document.querySelector('#gn-count');
  let day = 'all';
  let kind = 'all';

  function updatePlaces() {
    let visible = 0;
    for (const card of cards) {
      const closed = day !== 'all' && card.dataset.days[Number(day)] === '0';
      card.hidden = closed || (kind !== 'all' && kind !== card.dataset.kind);
      if (!card.hidden) visible += 1;
    }
    for (const area of areas) {
      area.hidden = !area.querySelector('[data-point]:not([hidden])');
    }

    if (pins) {
      pins.group.clearLayers();
      pins.group.addLayers(pins.places.filter(({place}) => !place.hidden).map(({marker}) => marker));
      pins.fit();
    }
    count.textContent = `숙소 1곳과 강릉 후보 ${visible}곳`;
  }

  for (const button of filters.querySelectorAll('button')) {
    button.addEventListener('click', () => {
      if (button.dataset.day !== undefined) day = button.dataset.day;
      else kind = button.dataset.kindFilter;
      for (const option of button.parentElement.querySelectorAll('button')) {
        option.setAttribute('aria-pressed', String(option === button));
      }
      updatePlaces();
    });
  }
  filters.hidden = false;
})();
