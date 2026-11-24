/** Business and security parameters taken from the SRS (BR, NFR). */
export const OTP_LENGTH = 6; // BR05
export const OTP_TTL_MINUTES = 30; // BR05
export const OTP_MAX_TRIES = 5; // UC13 alternate flow 5a
export const MAX_REDELIVERY = 2; // BR06
export const LOGIN_MAX_FAILS = 5; // NFR06
export const LOGIN_LOCK_MINUTES = 15; // NFR06
export const ROUTE_TIME_LIMIT_MS = 25_000; // design doc 5.2 (NFR02: < 30 s)
export const GPS_INTERVAL_SECONDS = 30; // FR23
export const SESSION_HOURS = 12;
export const ROAD_FACTOR = 1.3; // straight-line km -> estimated road km
export const AVG_SPEED_KMH = 25; // urban truck speed used for ETA
export const SERVICE_MINUTES = 8; // time spent at each stop
export const MAX_STOPS_PER_TRIP = 35; // one shift: 35 stops x 8 min plus driving fits in 8 hours
export const SERVICE_REMIND_DAYS = 7; // FR14: remind 7 days before service
export const SERVICE_INTERVAL_DAYS = 90; // next service after a completed one
