(() => {
  const courses = {
    gangwon: ['강릉 · 평창 · 속초', '바다와 설경을 함께 보는 동해안 코스', ['gangneung', 'pyeongchang', 'sokcho']],
    gyeongju: ['경주 · 부산', '한옥 골목과 바다 야경을 잇는 코스', ['gyeongju', 'busan']],
    jeonnam: ['순천 · 여수 · 광양', '갈대밭, 밤바다, 남도 음식 코스', ['suncheon', 'yeosu', 'gwangyang']],
    jeju: ['제주 동부 · 서귀포 · 서부', '일출봉에서 동백과 차밭까지', ['jeju-east', 'seogwipo', 'jeju-west']],
    jeonju: ['전주 · 담양 · 광주', '한옥과 대숲, 전시를 묶는 코스', ['jeonju', 'damyang', 'gwangju']],
    southcoast: ['통영 · 거제 · 남해', '항구와 바다 전망을 잇는 코스', ['tongyeong', 'geoje', 'namhae']],
    deogyusan: ['무주 · 진안 · 전주', '덕유산 눈꽃과 마이산, 전주 한옥', ['muju', 'jinan', 'jeonju']],
    eastcoast: ['포항 · 영덕 · 울진', '일출, 대게, 온천이 있는 해안 코스', ['pohang', 'yeongdeok', 'uljin']],
  };
  const params = new URLSearchParams(location.search);
  const requestedCourse = params.get('course');
  const course = Object.hasOwn(courses, requestedCourse) ? requestedCourse : 'gangwon';
  const [title, intro, cityIds] = courses[course];
  const requestedCity = params.get('city');
  const selectedCity = cityIds.includes(requestedCity) ? requestedCity : null;
  const heading = selectedCity ? winterPlaces[selectedCity].name : title;
  const main = document.querySelector('#winter-main');
  const nav = document.querySelector('#winter-city-nav');

  const groups = [
    ['V', '가볼 곳'],
    ['F', '먹거리'],
    ['H', '2인 1박 숙소'],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function link(label, url, className) {
    const node = el('a', className, label);
    node.href = url;
    return node;
  }

  function photoGallery(place) {
    const figure = el('figure', 'paju-place-photo');
    const track = el('div', 'paju-photo-track');
    track.setAttribute('role', 'group');
    track.setAttribute('aria-label', `${place.name} 사진 모음`);
    track.tabIndex = 0;
    place.photos.forEach((url, index) => {
      const label = `${place.name} 사진 ${index + 1}`;
      const slide = link('', place.photoSource, 'paju-photo-slide');
      slide.dataset.credit = place.photoCredit || '네이버 플레이스';
      slide.setAttribute('aria-label', `${label} 출처 열기`);
      const img = el('img');
      img.src = url;
      img.alt = label;
      img.width = 560;
      img.height = 420;
      img.loading = 'lazy';
      img.decoding = 'async';
      const fallback = el('span', 'paju-photo-fallback', '출처에서 사진 보기 ↗');
      fallback.hidden = true;
      slide.append(img, fallback);
      track.append(slide);
    });
    figure.append(track);

    if (place.photos.length > 1) {
      const controls = el('div', 'paju-photo-controls');
      controls.hidden = true;
      const previous = el('button', '', '‹');
      const next = el('button', '', '›');
      previous.type = next.type = 'button';
      previous.setAttribute('aria-label', '이전 사진');
      next.setAttribute('aria-label', '다음 사진');
      const count = el('span', 'paju-photo-count', `1 / ${place.photos.length}`);
      count.setAttribute('aria-live', 'polite');
      controls.append(previous, count, next);
      figure.append(controls);
    }
    const caption = el('figcaption');
    caption.append(link(`사진 · ${place.photoCredit || '네이버 플레이스'} ↗`, place.photoSource));
    figure.append(caption);
    return figure;
  }

  function placeCard(place, city) {
    const card = el('article', 'card place-body');
    const copy = el('div', 'winter-place-copy');
    const query = place.search || `${city.name} ${place.name}`;
    const searchUrl = `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
    const mapUrl = place.placeId ? `https://map.naver.com/p/entry/place/${place.placeId}` : searchUrl;
    if (place.tier) {
      const tiers = city.budget || ['10만 원 미만', '10만~20만 원 미만', '20만 원 이상'];
      const price = tiers[['실속', '중간', '프리미엄'].indexOf(place.tier)];
      copy.append(el('p', 'tags winter-tier', `${place.tier} 예산 · ${price}`));
    }
    copy.append(el('h4', '', place.name), el('p', '', place.note));
    const links = el('div', 'stops');
    links.append(link(place.listing ? '주변 후보 지도 ↗' : '지도·영업정보 ↗', mapUrl));
    if (place.kind === 'H') {
      links.append(link('날짜별 요금 확인 ↗', place.booking || `https://www.google.com/travel/search?q=${encodeURIComponent(query + ' 숙박')}`));
    } else if (!place.photos?.length) {
      links.append(link('장소 사진 검색 ↗', `https://search.naver.com/search.naver?where=image&query=${encodeURIComponent(query)}`));
    }
    copy.append(links);
    card.append(copy);
    if (place.photos?.length) {
      card.classList.add('winter-with-photo');
      card.append(photoGallery(place));
    }
    return card;
  }

  document.title = `${heading} 상세 가이드 | 우리의 겨울 여행`;
  document.querySelector('#winter-title').textContent = heading;
  document.querySelector('#winter-intro').textContent = selectedCity ? `${title} 코스 · ${winterPlaces[selectedCity].theme}` : intro;
  main.replaceChildren();
  const overview = el('div', 'note winter-budget-note');
  overview.append(el('strong', '', '숙소는 2인 1박 예산별로 비교'),
    el('p', '', '금액은 해당 도시에서 숙소를 고를 때 쓰는 계획용 구간이에요. 카드 속 숙소의 예약가는 날짜·객실·전망에 따라 달라져요. 12월 말 주말과 연휴에는 해당 예산대를 넘을 수 있으니 날짜를 넣고 최종 금액을 확인하세요.'));
  main.append(overview);

  const navRow = nav.querySelector('.wrap');
  if (selectedCity) navRow.append(link('코스 전체', `./winter.html?course=${course}`));
  for (const cityId of cityIds) {
    const cityLink = link(winterPlaces[cityId].name, selectedCity ? `./winter.html?course=${course}&city=${cityId}` : `#${cityId}`);
    if (cityId === selectedCity) cityLink.setAttribute('aria-current', 'page');
    navRow.append(cityLink);
  }
  for (const cityId of selectedCity ? [selectedCity] : cityIds) {
    const city = winterPlaces[cityId];
    const section = el('section', 'section winter-city');
    section.id = cityId;
    section.append(el('div', 'section-kicker', city.theme), el('h2', '', city.name), el('p', 'lead', city.tip));
    if (!selectedCity) {
      section.append(link(`${city.name}만 보기 ↗`, `./winter.html?course=${course}&city=${cityId}`, 'action'));
    }
    for (const [kind, label] of groups) {
      const group = el('div', 'winter-place-group');
      group.append(el('h3', '', label));
      const grid = el('div', 'grid');
      for (const place of city.places.filter(place => place.kind === kind)) {
        grid.append(placeCard(place, city));
      }
      group.append(grid);
      section.append(group);
    }
    main.append(section);
  }
  nav.hidden = false;

  const other = el('section', 'section winter-other');
  other.append(el('h2', '', '다른 겨울 코스 둘러보기'));
  const choices = el('div', 'stops');
  for (const [id, [name]] of Object.entries(courses)) {
    if (name !== title) choices.append(link(name, `./winter.html?course=${id}`));
  }
  other.append(choices);
  main.append(other);

  const cityAnchor = location.hash.slice(1);
  if (cityIds.includes(cityAnchor)) document.getElementById(cityAnchor)?.scrollIntoView();
})();
