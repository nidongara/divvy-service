const express = require('express');
const moment = require('moment');
const DataService = require('../../services/data-service');
const router = express.Router();
const dataService = new DataService().getInstance();

/**
 * Get station information for a give station ID.
 * Example Request : GET /station/1436495105198659242
 * Example Response :
 *  {
 *   "lon": -87.653449,
 *   "eightd_has_key_dispenser": false,
 *   "external_id": "motivate_CHI_1436495105198659242",
 *   "station_type": "lightweight",
 *   "rack_model": "CITY_PILOT_RACK",
 *   "rental_uris": {
 *       "android": "https://chi.lft.to/lastmile_qr_scan",
 *       "ios": "https://chi.lft.to/lastmile_qr_scan"
 *   },
 *   "has_kiosk": false,
 *   "name": "W Armitage Ave & N Sheffield Ave",
 *   "station_id": "1436495105198659242",
 *   "eightd_station_services": [],
 *   "dockless_bikes_parking_zone_capacity": 8,
 *   "region_code": "CHI",
 *   "lat": 41.917805,
 *   "address": "1964, North Sheffield Avenue, Lincoln Park, Chicago, Cook County, Illinois, 60614, United States of America",
 *   "legacy_id": "1436495105198659242",
 *   "electric_bike_surcharge_waiver": false,
 *   "capacity": 8,
 *   "client_station_id": "motivate_CHI_1436495105198659242"
 *  }
 */
router.get('/station/:stationId', async (req, res) => {
  const station = await dataService.getStation(req.params.stationId);
  if(!station){
    res.boom.notFound();
    return;
  }
  res.send(station);
});

/**
 * Given one or more stations, return the number of riders in the following age groups,
 * [0-20,21-30,31-40,41-50,51+, unknown], who ended their trip at that station for a given
 * day. Accepts an array of station ids and a date in format MM/DD/YYYY.
 * Example Request : GET /riders?station=1436495105198659242&station=503&station=546&date=08/30/2020
 */
router.get('/riders', async (req, res) => {
  const queryData = req.query;
  if(queryData.station && !Array.isArray(queryData.station)){
    queryData.station = [queryData.station]
  }
  if(!validRequest(req, res, queryData)){
    return;
  }
  const requestedDate = moment(queryData.date, 'MM/DD/YYYY');
  const riders = await dataService.getRidersForDate(queryData.station, requestedDate);
  res.send(riders);
});

/**
 * Given one or more stations, return the number of riders in the following age groups,
 * [0-20,21-30,31-40,41-50,51+, unknown], who ended their trip at that station for a given
 * day. Accepts an array of station ids and a date in format MM/DD/YYYY.
 * Example Request : GET /riders?station=1436495105198659242&station=503&station=546&date=08/30/2020
 */
router.get('/last-trips', async (req, res) => {
  const queryData = req.query;
  if(queryData.station && !Array.isArray(queryData.station)){
    queryData.station = [queryData.station]
  }
  if(!validRequest(req, res, queryData)){
    return;
  }
  const requestedDate = moment(queryData.date, 'MM/DD/YYYY');
  const riders = await dataService.getLastTrips(queryData.station, requestedDate);
  res.send(riders);
});

const validRequest = (req,res, queryData) => {
  if(!dataService.cacheInitialized){
    res.boom.serverUnavailable("Please try again in sometime. We are building cache.")
    return false;
  }

  if(!queryData.station || !Array.isArray(queryData.station) ||!queryData.station.length>0){
    res.boom.badRequest("Station ID/s are missing in request")
    return false;
  }
  if(!queryData.date || !moment(queryData.date, 'MM/DD/YYYY').isValid()){
    res.boom.badRequest("Invalid Date provided")
    return false;
  }
  return true;
}

module.exports = router;
