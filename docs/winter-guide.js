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
  const stayDates = [
    ['2026-12-25', '2026-12-26', '12/25(금) → 12/26(토)'],
    ['2026-12-26', '2026-12-27', '12/26(토) → 12/27(일)'],
    ['2026-12-27', '2026-12-28', '12/27(일) → 12/28(월)'],
    ['2026-12-28', '2026-12-29', '12/28(월) → 12/29(화)'],
    ['2026-12-29', '2026-12-30', '12/29(화) → 12/30(수)'],
    ['2026-12-30', '2026-12-31', '12/30(수) → 12/31(목)'],
  ];
  let stay = stayDates.find(([checkin]) => checkin === params.get('stay')) || stayDates[0];
  const rateLinks = [];
  const bookingDates = [];
  const guideLinks = [];
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

  function rateUrl(query, platform, directUrl) {
    const [checkin, checkout] = stay;
    if (platform === 'NOL') {
      const url = new URL(directUrl);
      url.searchParams.set('checkInDate', checkin);
      url.searchParams.set('checkOutDate', checkout);
      url.searchParams.set('adultCount', '2');
      return url.href;
    }
    if (platform === 'Trip.com') {
      const search = new URLSearchParams({
        searchWord: query,
        checkin,
        checkout,
        adult: '2',
        children: '0',
        crn: '1',
        curr: 'KRW',
      });
      return `https://kr.trip.com/hotels/list?${search}`;
    }
    const search = new URLSearchParams({
      ss: query,
      checkin,
      checkout,
      group_adults: '2',
      group_children: '0',
      no_rooms: '1',
      selected_currency: 'KRW',
      lang: 'ko',
    });
    return `https://www.booking.com/searchresults.ko.html?${search}`;
  }

  function bookingPlatform(url) {
    const {hostname} = new URL(url);
    if (hostname === 'www.yeogi.com') return '여기어때';
    if (hostname === 'nol.yanolja.com') return 'NOL';
    return '공식 사이트';
  }

  function guideLink(label, courseId, cityId, className) {
    const query = new URLSearchParams({course: courseId, stay: stay[0]});
    if (cityId) query.set('city', cityId);
    const anchor = link(label, `./winter.html?${query}`, className);
    guideLinks.push(anchor);
    return anchor;
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
    if (place.kind !== 'H' && !place.photos?.length) {
      links.append(link('장소 사진 검색 ↗', `https://search.naver.com/search.naver?where=image&query=${encodeURIComponent(query)}`));
    }
    copy.append(links);

    if (place.kind === 'H') {
      const booking = el('div', 'winter-booking');
      const dates = el('small', '', stay[2] + ' · 성인 2명');
      bookingDates.push(dates);
      const platforms = el('div', 'winter-booking-platforms');
      for (const platform of ['Booking.com', 'Trip.com']) {
        const rate = link(platform + ' ↗', rateUrl(query, platform));
        rate.setAttribute('aria-label', `${place.name} ${platform} 선택 날짜 요금 검색`);
        rateLinks.push({rate, query, platform});
        platforms.append(rate);
      }
      booking.append(el('strong', '', '요금·빈 객실 확인'), dates, platforms);

      if (place.booking) {
        const platform = bookingPlatform(place.booking);
        if (platform === 'NOL') {
          const rate = link('NOL 숙소 예약 ↗', rateUrl(query, platform, place.booking));
          rate.setAttribute('aria-label', `${place.name} NOL 선택 날짜 예약`);
          rateLinks.push({rate, query, platform, directUrl: place.booking});
          platforms.append(rate);
        } else {
          const direct = link(platform + ' 숙소 페이지 ↗', place.booking);
          booking.append(direct, el('small', '', '숙소 페이지에서 날짜 직접 선택'));
        }
      }
      copy.append(booking);
    }
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
  const stayLabel = el('label', '', '2026년 12월 숙박일 · 성인 2명, 객실 1개');
  stayLabel.htmlFor = 'winter-stay';
  const staySelect = el('select');
  staySelect.id = 'winter-stay';
  for (const [checkin, , dates] of stayDates) {
    const option = el('option', '', dates + ' · 1박');
    option.value = checkin;
    staySelect.append(option);
  }
  staySelect.value = stay[0];
  overview.append(stayLabel, staySelect,
    el('p', '', '카드 금액은 2인 1박 계획 예산이에요. Booking.com·Trip.com과 일부 카드의 NOL 예약 링크에 위 날짜와 인원이 적용돼요. 플랫폼별 최종 요금과 빈 객실을 비교해 보세요.'));
  main.append(overview);

  const navRow = nav.querySelector('.wrap');
  if (selectedCity) navRow.append(guideLink('코스 전체', course));
  for (const cityId of cityIds) {
    const cityName = winterPlaces[cityId].name;
    const cityLink = selectedCity ? guideLink(cityName, course, cityId) : link(cityName, `#${cityId}`);
    if (cityId === selectedCity) cityLink.setAttribute('aria-current', 'page');
    navRow.append(cityLink);
  }
  for (const cityId of selectedCity ? [selectedCity] : cityIds) {
    const city = winterPlaces[cityId];
    const section = el('section', 'section winter-city');
    section.id = cityId;
    section.append(el('div', 'section-kicker', city.theme), el('h2', '', city.name), el('p', 'lead', city.tip));
    if (!selectedCity) {
      section.append(guideLink(`${city.name}만 보기 ↗`, course, cityId, 'action'));
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
    if (name !== title) choices.append(guideLink(name, id));
  }
  other.append(choices);
  main.append(other);

  staySelect.addEventListener('change', () => {
    stay = stayDates.find(([checkin]) => checkin === staySelect.value);
    const currentUrl = new URL(location.href);
    currentUrl.searchParams.set('stay', stay[0]);
    history.replaceState(null, '', currentUrl);
    for (const {rate, query, platform, directUrl} of rateLinks) rate.href = rateUrl(query, platform, directUrl);
    for (const dates of bookingDates) dates.textContent = stay[2] + ' · 성인 2명';
    for (const anchor of guideLinks) {
      const target = new URL(anchor.href);
      target.searchParams.set('stay', stay[0]);
      anchor.href = target;
    }
  });

  const cityAnchor = location.hash.slice(1);
  if (cityIds.includes(cityAnchor)) document.getElementById(cityAnchor)?.scrollIntoView();
})();
