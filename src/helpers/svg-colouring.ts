import { point, booleanPointInPolygon } from "@turf/turf";
import land from "../assets/land.json";
import glaciated_areas from "../assets/glaciated_areas.json";
import arctic_ice_shelves from "../assets/antarctic_ice_shelves.json";
import { LandUsage } from "../types/LandUsage";
import { RGB } from "../types/RGB";

const getLandUsage = (latitude: number, longitude: number): LandUsage => {
  const pt = point([longitude, latitude]);
  if (
    land.geometries.some((feature: any) => booleanPointInPolygon(pt, feature))
  ) {
    if (
      glaciated_areas.geometries.some((feature: any) =>
        booleanPointInPolygon(pt, feature)
      )
    ) {
      return "glaciated_areas";
    }

    return "land";
  }

  if (
    arctic_ice_shelves.geometries.some((feature: any) =>
      booleanPointInPolygon(pt, feature)
    )
  ) {
    return "antarctic_ice_shelves";
  }

  return "water";
};

const colourByLandUsage = (landUsage: LandUsage): RGB => {
  switch (landUsage) {
    case "water":
      return [119, 159, 196];
    case "land":
      return [178, 200, 169];
    case "glaciated_areas":
      return [233, 240, 248];
    case "antarctic_ice_shelves":
      return [241, 231, 212];
  }
}

export { getLandUsage, colourByLandUsage };