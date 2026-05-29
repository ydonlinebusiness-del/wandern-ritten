declare module "leaflet.heat" {
  const plugin: unknown;
  export default plugin;
}

import * as L from "leaflet";
declare module "leaflet" {
  interface HeatMapOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: Record<number, string>;
  }
  type HeatLatLngTuple = [number, number, number?];
  function heatLayer(
    latlngs: HeatLatLngTuple[],
    options?: HeatMapOptions,
  ): L.Layer;
}
