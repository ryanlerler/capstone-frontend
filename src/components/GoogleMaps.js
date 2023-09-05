import { useEffect, useState, useMemo, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import axios from "axios";

const libraries = ["places"];

export default function GoogleMaps({
  latitude,
  longitude,
  nearbyPlaces,
  selectedPlace,
  setSelectedPlace,
}) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  const containerStyle = {
    width: "100vw",
    height: "50vh",
  };

  const center = useMemo(() => {
    return {
      lat: latitude,
      lng: longitude,
    };
  }, [latitude, longitude]);

  const [map, setMap] = useState(null);
  const [centerMarker, setCenterMarker] = useState(null); // State to hold the center marker instance
  const [placeDetails, setPlaceDetails] = useState(null);

  useEffect(() => {
    // Add animation to the center marker once it's loaded
    if (centerMarker) {
      centerMarker.setAnimation(window.google.maps.Animation.BOUNCE);
    }
  }, [centerMarker]);

  useEffect(() => {
    if (selectedPlace) {
      fetchPlaceDetails(selectedPlace);
    }
  }, [selectedPlace]);

  const onLoad = useCallback(function callback(map) {
    // const bounds = new window.google.maps.LatLngBounds(center);
    // map.fitBounds(bounds);

    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  // Function to get the icon URL based on place type
  const getMarkerIcon = (placeType) => {
    if (placeType === "restaurant") {
      return "http://maps.gstatic.com/mapfiles/ms2/micons/restaurant.png";
    } else if (placeType === "atm") {
      return "http://maps.gstatic.com/mapfiles/ms2/micons/dollar.png";
    } else if (placeType === "transit_station") {
      return "http://maps.gstatic.com/mapfiles/ms2/micons/bus.png";
    } else if (placeType === "convenience_store") {
      return "http://maps.gstatic.com/mapfiles/ms2/micons/shopping.png";
    } else if (placeType === "shopping_mall") {
      return "http://maps.gstatic.com/mapfiles/ms2/micons/convienancestore.png";
    } else {
      return null;
    }
  };

  // Function to fetch place details including photos, ratings, and reviews
  const fetchPlaceDetails = async (place) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/places/details`,
        {
          params: {
            placeId: place.place_id,
          },
        }
      );
      setPlaceDetails(response.data);
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const handleMarkerClick = (place) => {
    setSelectedPlace(place);
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      <Marker position={center} onLoad={(marker) => setCenterMarker(marker)} />

      {nearbyPlaces.map((place) => (
        <Marker
          key={place.place_id}
          position={{
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          }}
          icon={{
            url: getMarkerIcon(place.types[0]),
            scaledSize: new window.google.maps.Size(25, 25),
          }}
          onClick={() => handleMarkerClick(place)}
        />
      ))}

      {selectedPlace && placeDetails && (
        <InfoWindow
          position={{
            lat: selectedPlace.geometry.location.lat,
            lng: selectedPlace.geometry.location.lng,
          }}
          onCloseClick={() => setSelectedPlace(null)}
        >
          <div>
            <h3>{placeDetails.name}</h3>
            <p>{placeDetails.formatted_address}</p>
            {placeDetails.rating && <p>Rating: {placeDetails.rating}</p>}
            {placeDetails.reviews && placeDetails.reviews.length > 0 && (
              <div>
                <h4>Reviews:</h4>
                <ul>
                  {placeDetails.reviews.map((review) => (
                    <li key={review.time}>
                      <p>{review.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <></>
  );
}
