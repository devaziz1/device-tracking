const socket = io();

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    (err) => {
      console.error("Error getting location", err);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap",
}).addTo(map);

const makers = {};

socket.on("receive-location", (data) => {
  const { id, longitude, latitude } = data;
  map.setView([latitude, longitude], 16);
  if (makers[id]) {
    makers[id].setLatLng([latitude, longitude]);
  } else {
    makers[id] = L.marker([latitude, longitude]).addTo(map);
  }
});

socket.on("user-disconnect", (id) => {
  if (makers[id]) {
    map.removeLayer(makers[id]);
    delete makers[id];
  }
});
