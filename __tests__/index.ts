import type { Feature, LineString } from "geojson";
import * as polyline from "../lib/index";

const example = [
  [38.5, -120.2],
  [40.7, -120.95],
  [43.252, -126.453],
];
const exampleWithZ = [
  [38.5, -120.2, 0],
  [40.7, -120.95, 0],
  [43.252, -126.453, 0],
];
// encoded value will enclude slashes -> tests escaping
const example_slashes = [
  [35.6, -82.55],
  [35.59985, -82.55015],
  [35.6, -82.55],
];
const example_flipped = [
  [-120.2, 38.5],
  [-120.95, 40.7],
  [-126.453, 43.252],
];
const example_rounding = [
  [0, 0.000006],
  [0, 0.000002],
];
const example_rounding_negative = [
  [36.05322, -112.084004],
  [36.053573, -112.083914],
  [36.053845, -112.083965],
];

const geojson: Feature<LineString> = {
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: example_flipped,
  },
  properties: {},
};

describe("#decode()", () => {
  it("decodes an empty Array", () => {
    expect(polyline.decode("")).toEqual([]);
  });

  it("decodes a String into an Array of lat/lon pairs", () => {
    expect(polyline.decode("_p~iF~ps|U_ulLnnqC_mqNvxq`@")).toEqual(example);
  });
});

describe("#identity", () => {
  it("feed encode into decode and check if the result is the same as the input", () => {
    expect(polyline.decode(polyline.encode(example_slashes))).toEqual(
      example_slashes
    );
  });

  it("feed decode into encode and check if the result is the same as the input", () => {
    expect(polyline.encode(polyline.decode("_chxEn`zvN\\\\]]"))).toEqual(
      "_chxEn`zvN\\\\]]"
    );
  });
});

describe("#encode()", () => {
  it("encodes an empty Array", () => {
    expect(polyline.encode([])).toEqual("");
  });

  it("encodes an Array of lat/lon pairs into a String", () => {
    expect(polyline.encode(example)).toEqual("_p~iF~ps|U_ulLnnqC_mqNvxq`@");
  });

  it("encodes an Array of lat/lon/z into the same string as lat/lon", () => {
    expect(polyline.encode(exampleWithZ)).toEqual(
      "_p~iF~ps|U_ulLnnqC_mqNvxq`@"
    );
  });

  it("encodes with proper rounding", () => {
    expect(polyline.encode(example_rounding)).toEqual("?A?@");
  });

  it("encodes with proper negative rounding", () => {
    expect(polyline.encode(example_rounding_negative)).toEqual(
      "ss`{E~kbkTeAQw@J"
    );
  });
});

describe("#fromGeoJSON()", () => {
  it("allows geojson geometries", () => {
    expect(polyline.geoJSONToPolyline(geojson.geometry)).toEqual(
      "_p~iF~ps|U_ulLnnqC_mqNvxq`@"
    );
  });
});

describe("#toGeoJSON()", () => {
  it("flips coordinates and decodes geometry", () => {
    expect(polyline.polylineToGeoJSON("_p~iF~ps|U_ulLnnqC_mqNvxq`@")).toEqual({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: null,
          geometry: geojson.geometry,
        },
      ],
    });
  });
});
