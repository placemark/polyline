import { describe, expect, it } from "vitest";
import type { LineString } from "geojson";
import * as polyline from "../lib/index";

const example = [
  [-120.2, 38.5],
  [-120.95, 40.7],
  [-126.453, 43.252],
];

const exampleWithZ = [
  [-120.2, 38.5, 0],
  [-120.95, 40.7, 0],
  [-126.453, 43.252, 0],
];

// encoded value will enclude slashes -> tests escaping
const example_slashes = [
  [-82.55, 35.6],
  [-82.55015, 35.59985],
  [-82.55, 35.6],
];

const example_rounding = [
  [0.000006, 0],
  [0.000002, 0],
];

const example_rounding_negative = [
  [-112.084004, 36.05322],
  [-112.083914, 36.053573],
  [-112.083965, 36.053845],
];

const geojson: LineString = {
  type: "LineString",
  coordinates: example,
};

describe("#decode()", () => {
  it("decodes an empty Array", () => {
    expect(polyline.decode("")).toEqual([]);
  });

  it("decodes any string, but coordinates will be weird", () => {
    expect(polyline.decode("Hello, world!")).toEqual([
      [70.84755, -0.00005],
      [434.83615, -0.00006],
    ]);
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
    expect(polyline.geoJSONToPolyline(geojson)).toEqual(
      "_p~iF~ps|U_ulLnnqC_mqNvxq`@"
    );
  });
});

describe("#toGeoJSON()", () => {
  it("flips coordinates and decodes geometry", () => {
    expect(polyline.polylineToGeoJSON("_p~iF~ps|U_ulLnnqC_mqNvxq`@")).toEqual(
      geojson
    );
  });
});
