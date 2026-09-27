// Ensure mapboxgl uses lowercase 'm'
mapboxgl.accessToken = mapToken;

// Check if geometry and valid coordinates [lng, lat] exist in the listing data
const coordinates = (listing.geometry && listing.geometry.coordinates && listing.geometry.coordinates.length === 2)
  ? listing.geometry.coordinates
  : [80.56187, 26.55452]; // Default fallback coordinates

const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: coordinates, // [lng, lat]
  zoom: 9 // starting zoom
});

// Always render the marker at either the actual or fallback location
new mapboxgl.Marker({ color: 'red' })
  .setLngLat(coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h4>${listing.title}</h4><p>${listing.location ? listing.location : 'Exact Location provided after booking'}</p>`
    )
  )
  .addTo(map);