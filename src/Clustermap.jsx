import axios from "axios";
import React, { useEffect } from "react";

const Clustermap = () => {
  //   useEffect(async () => {
  //     const { data } = await axios.get(
  //       "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson"
  //     );
  //     console.log(data);
  //   }, []);

  const mapbox_token =
    "pk.eyJ1IjoidmlzaGFsbWFnYXIiLCJhIjoiY2xmMjlmdzcyMDE0YTNwbXFud2tzZXd3NSJ9.ODkSEBC03nGlHWCtzWNsrw";

  mapboxgl.accessToken = mapbox_token;
  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/dark-v10",
    zoom: 1.5,
    center: [0, 20],
  });

  map.on("load", () => {
    map.addSource("earthquakes", {
      type: "geojson",

      data: "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson",
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });

    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "earthquakes",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": [
          "step",
          ["get", "point_count"],
          "#51bbd6",
          100,
          "#f1f075",
          750,
          "#f28cb1",
        ],
        "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
      },
    });

    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "earthquakes",
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12,
      },
    });

    map.on("click", "clusters", (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      const clusterId = features[0].properties.cluster_id;
      map
        .getSource("earthquakes")
        .getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          });
        });
    });

    map.on("click", "unclustered-point", (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const mag = e.features[0].properties.mag;
      const tsunami = e.features[0].properties.tsunami === 1 ? "yes" : "no";

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`magnitude: ${mag}<br>Was there a tsunami?: ${tsunami}`)
        .addTo(map);
    });

    map.on("mouseenter", "clusters", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "clusters", () => {
      map.getCanvas().style.cursor = "";
    });
  });
};

export default Clustermap;
