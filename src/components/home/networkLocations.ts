/**
 * Delivery network locations for the animated hero map.
 * 30 U.S. states (major city per state) + 40 countries (major city each).
 * Coordinates are [lng, lat].
 */

export interface NetworkLocation {
  label: string;
  lng: number;
  lat: number;
  region: "us" | "world";
}

export const US_LOCATIONS: NetworkLocation[] = [
  { label: "California", lng: -118.24, lat: 34.05, region: "us" },
  { label: "Texas", lng: -95.37, lat: 29.76, region: "us" },
  { label: "Florida", lng: -80.19, lat: 25.76, region: "us" },
  { label: "New York", lng: -74.0, lat: 40.71, region: "us" },
  { label: "Illinois", lng: -87.63, lat: 41.88, region: "us" },
  { label: "Pennsylvania", lng: -75.17, lat: 39.95, region: "us" },
  { label: "Ohio", lng: -82.99, lat: 39.96, region: "us" },
  { label: "Georgia", lng: -84.39, lat: 33.75, region: "us" },
  { label: "North Carolina", lng: -80.84, lat: 35.23, region: "us" },
  { label: "Michigan", lng: -83.05, lat: 42.33, region: "us" },
  { label: "New Jersey", lng: -74.17, lat: 40.74, region: "us" },
  { label: "Virginia", lng: -77.44, lat: 37.54, region: "us" },
  { label: "Washington", lng: -122.33, lat: 47.61, region: "us" },
  { label: "Arizona", lng: -112.07, lat: 33.45, region: "us" },
  { label: "Massachusetts", lng: -71.06, lat: 42.36, region: "us" },
  { label: "Tennessee", lng: -86.78, lat: 36.16, region: "us" },
  { label: "Indiana", lng: -86.16, lat: 39.77, region: "us" },
  { label: "Missouri", lng: -90.2, lat: 38.63, region: "us" },
  { label: "Maryland", lng: -76.61, lat: 39.29, region: "us" },
  { label: "Wisconsin", lng: -87.91, lat: 43.04, region: "us" },
  { label: "Colorado", lng: -104.99, lat: 39.74, region: "us" },
  { label: "Minnesota", lng: -93.27, lat: 44.98, region: "us" },
  { label: "South Carolina", lng: -79.93, lat: 32.78, region: "us" },
  { label: "Alabama", lng: -86.8, lat: 33.52, region: "us" },
  { label: "Louisiana", lng: -90.07, lat: 29.95, region: "us" },
  { label: "Kentucky", lng: -85.76, lat: 38.25, region: "us" },
  { label: "Oregon", lng: -122.68, lat: 45.52, region: "us" },
  { label: "Oklahoma", lng: -97.52, lat: 35.47, region: "us" },
  { label: "Nevada", lng: -115.14, lat: 36.17, region: "us" },
  { label: "Utah", lng: -111.89, lat: 40.76, region: "us" },
];

export const WORLD_LOCATIONS: NetworkLocation[] = [
  { label: "Canada", lng: -79.38, lat: 43.65, region: "world" },
  { label: "Mexico", lng: -99.13, lat: 19.43, region: "world" },
  { label: "Brazil", lng: -46.63, lat: -23.55, region: "world" },
  { label: "Argentina", lng: -58.38, lat: -34.6, region: "world" },
  { label: "United Kingdom", lng: -0.13, lat: 51.51, region: "world" },
  { label: "Ireland", lng: -6.26, lat: 53.35, region: "world" },
  { label: "France", lng: 2.35, lat: 48.86, region: "world" },
  { label: "Germany", lng: 13.4, lat: 52.52, region: "world" },
  { label: "Spain", lng: -3.7, lat: 40.42, region: "world" },
  { label: "Portugal", lng: -9.14, lat: 38.72, region: "world" },
  { label: "Italy", lng: 12.5, lat: 41.9, region: "world" },
  { label: "Netherlands", lng: 4.9, lat: 52.37, region: "world" },
  { label: "Belgium", lng: 4.35, lat: 50.85, region: "world" },
  { label: "Switzerland", lng: 8.54, lat: 47.38, region: "world" },
  { label: "Austria", lng: 16.37, lat: 48.21, region: "world" },
  { label: "Norway", lng: 10.75, lat: 59.91, region: "world" },
  { label: "Sweden", lng: 18.07, lat: 59.33, region: "world" },
  { label: "Finland", lng: 24.94, lat: 60.17, region: "world" },
  { label: "Denmark", lng: 12.57, lat: 55.68, region: "world" },
  { label: "Poland", lng: 21.01, lat: 52.23, region: "world" },
  { label: "Ukraine", lng: 30.52, lat: 50.45, region: "world" },
  { label: "Turkey", lng: 28.98, lat: 41.01, region: "world" },
  { label: "UAE", lng: 55.27, lat: 25.2, region: "world" },
  { label: "Saudi Arabia", lng: 46.68, lat: 24.71, region: "world" },
  { label: "Qatar", lng: 51.53, lat: 25.29, region: "world" },
  { label: "India", lng: 72.88, lat: 19.08, region: "world" },
  { label: "Pakistan", lng: 67.01, lat: 24.86, region: "world" },
  { label: "Bangladesh", lng: 90.41, lat: 23.81, region: "world" },
  { label: "China", lng: 121.47, lat: 31.23, region: "world" },
  { label: "Japan", lng: 139.69, lat: 35.69, region: "world" },
  { label: "South Korea", lng: 126.98, lat: 37.57, region: "world" },
  { label: "Singapore", lng: 103.82, lat: 1.35, region: "world" },
  { label: "Malaysia", lng: 101.69, lat: 3.14, region: "world" },
  { label: "Thailand", lng: 100.5, lat: 13.76, region: "world" },
  { label: "Indonesia", lng: 106.85, lat: -6.21, region: "world" },
  { label: "Australia", lng: 151.21, lat: -33.87, region: "world" },
  { label: "New Zealand", lng: 174.76, lat: -36.85, region: "world" },
  { label: "South Africa", lng: 28.05, lat: -26.2, region: "world" },
  { label: "Nigeria", lng: 3.39, lat: 6.45, region: "world" },
  { label: "Egypt", lng: 31.24, lat: 30.04, region: "world" },
];

export const ALL_LOCATIONS: NetworkLocation[] = [...US_LOCATIONS, ...WORLD_LOCATIONS];
