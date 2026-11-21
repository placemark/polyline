import type { LineString, Position } from "geojson";

// https://github.com/mapbox/polyline/blob/master/src/polyline.js

// Based off of [the offical Google document](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
//
// Some parts from [this implementation](http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/PolylineEncoder.js)
// by [Mark McClure](http://facstaff.unca.edu/mcmcclur/)

function py2_round(value: number) {
	// Google's polyline algorithm uses the same rounding strategy as Python 2,
	// which is different from JS for negative values
	return Math.floor(Math.abs(value) + 0.5) * (value >= 0 ? 1 : -1);
}

function encodeNumber(current: number, previous: number, factor: number) {
	current = py2_round(current * factor);
	previous = py2_round(previous * factor);
	// Use arithmetic instead of bitwise operators: those work on 32-bit
	// integers and overflow for large values (e.g. a 360° step at precision 7)
	let coordinate = (current - previous) * 2;
	if (coordinate < 0) {
		coordinate = -coordinate - 1;
	}
	let output = "";
	while (coordinate >= 0x20) {
		output += String.fromCharCode((0x20 | (coordinate % 32)) + 63);
		coordinate = Math.floor(coordinate / 32);
	}
	output += String.fromCharCode(coordinate + 63);
	return output;
}

function resultChange(result: number) {
	return result % 2 === 1 ? (-result - 1) / 2 : result / 2;
}

/**
 * Decodes any string into a [longitude, latitude] coordinates array.
 *
 * Any string is a valid polyline, but if you provide this
 * with an arbitrary string, it'll produce coordinates well
 * outside of the normal range.
 */
export function decode(str: string, precision: number = 5): Position[] {
	const factor = 10 ** precision;
	let index = 0;
	let lat = 0;
	let lng = 0;
	const coordinates = [];
	let shift = 0;
	let result = 0;
	let byte = null;

	let latitude_change: number;
	let longitude_change: number;

	// Coordinates have variable length when encoded, so just keep
	// track of whether we've hit the end of the string. In each
	// loop iteration, a single coordinate is decoded.
	while (index < str.length) {
		// Reset shift, result, and byte
		byte = null;
		shift = 1;
		result = 0;

		do {
			byte = str.charCodeAt(index++) - 63;
			result += (byte & 0x1f) * shift;
			shift *= 32;
		} while (byte >= 0x20);

		latitude_change = resultChange(result);

		shift = 1;
		result = 0;

		do {
			byte = str.charCodeAt(index++) - 63;
			result += (byte & 0x1f) * shift;
			shift *= 32;
		} while (byte >= 0x20);

		longitude_change = resultChange(result);

		lat += latitude_change;
		lng += longitude_change;

		coordinates.push([lng / factor, lat / factor]);
	}

	return coordinates;
}

/**
 * Encodes the given [latitude, longitude] coordinates array.
 *
 * @param coordinates Coordinates, in longitude, latitude order
 * @returns encoded polyline
 */
export function encode(coordinates: number[][], precision: number = 5) {
	if (!coordinates.length) {
		return "";
	}
	const factor = 10 ** precision;

	let output =
		encodeNumber(coordinates[0]![1]!, 0, factor) +
		encodeNumber(coordinates[0]![0]!, 0, factor);

	for (let i = 1; i < coordinates.length; i++) {
		const a = coordinates[i]!;
		const b = coordinates[i - 1]!;
		output += encodeNumber(a[1]!, b[1]!, factor);
		output += encodeNumber(a[0]!, b[0]!, factor);
	}

	return output;
}

/**
 * Encodes a GeoJSON LineString feature/geometry.
 *
 * @param geojson A LineString
 */
export function geoJSONToPolyline(geojson: LineString, precision: number = 5) {
	return encode(geojson.coordinates, precision);
}

/**
 * Decodes to a GeoJSON LineString geometry.
 *
 * @param str An encoded polyline as a string.
 */
export function polylineToGeoJSON(
	str: string,
	precision: number = 5,
): LineString {
	const coords = decode(str, precision);
	return {
		type: "LineString",
		coordinates: coords,
	};
}
