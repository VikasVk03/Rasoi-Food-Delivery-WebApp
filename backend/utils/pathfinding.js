const toRad = (value) => (value * Math.PI) / 180;

const haversineDistanceKm = (from, to) => {
  const earthRadius = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const interpolateSegment = (start, end, points = 12) => {
  const result = [];
  for (let index = 0; index <= points; index += 1) {
    const ratio = index / points;
    result.push({
      lat: Number((start.lat + (end.lat - start.lat) * ratio).toFixed(6)),
      lng: Number((start.lng + (end.lng - start.lng) * ratio).toFixed(6)),
    });
  }
  return result;
};

// Lightweight route builder: restaurant -> delivery -> user.
export const buildDeliveryRoute = ({
  restaurantLocation,
  userLocation,
  deliveryBoyLocation,
}) => {
  const routeToRestaurant = interpolateSegment(
    deliveryBoyLocation || restaurantLocation,
    restaurantLocation,
    8,
  );
  const routeToUser = interpolateSegment(restaurantLocation, userLocation, 14);

  const routePath = [...routeToRestaurant, ...routeToUser.slice(1)];
  const distanceKm = haversineDistanceKm(restaurantLocation, userLocation);

  return {
    routePath,
    distanceKm: Number(distanceKm.toFixed(2)),
  };
};
