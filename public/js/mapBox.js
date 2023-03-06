/* eslint-disable */
export default (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy',
    // center: [-74.5, 40],
    zoom: 10,
  });

  // SET BOUNDS
  const lngLats = locations.map((el) => el.coordinates);
  const lngLatBounds = new mapboxgl.LngLatBounds(...lngLats);

  map.fitBounds(lngLatBounds, {
    padding: { top: 200, bottom: 200, left: 100, right: 100 },
  });

  // CREATE MARKER
  lngLats.forEach((el) => {
    const element = document.createElement('div');
    element.classList.add('marker');
    new mapboxgl.Marker({ anchor: 'bottom', element }).setLngLat(el).addTo(map);
  });

  // CREATE POPUP
  locations.forEach((el) => {
    new mapboxgl.Popup({ closeOnClick: false, offset: 50 })
      .setLngLat(el.coordinates)
      .setHTML(`Day ${el.day} : ${el.description}`)
      .addTo(map);
  });

  // DISABLE SCROLL ZOOM
  map.scrollZoom.disable();
};
