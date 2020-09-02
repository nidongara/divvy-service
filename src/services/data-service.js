const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
const log4js = require("log4js");
const csv = require('csvtojson')

const logger = log4js.getLogger();

const defaultTripsResponse = {
  "0-20":0,
  "21-30":0,
  "31-40":0,
  "41-50":0,
  "51+":0,
  "unknown":0
}

class DataService {
  constructor() {
    this.stationsMap ={};
    this.tripsByEndDate = {};
  }


  async getStation(stationId) {
    if (!this.stationsMap[stationId]) {
      const response = await axios.get(process.env.URL_STATION_LIST);
      if (response && response.data && response.data.data && response.data.data.stations) {
        let stations = response.data.data.stations;
        this.stationsMap = _.keyBy(stations, function(o) {
          return o.station_id;
        });
        return this.stationsMap[stationId];
      }
    } else {
      // Returning from cache
      return this.stationsMap[stationId]
    }
  }

  async initTripsCache(){
    return new Promise((resolve, reject) =>{
      this.tripDataFileName = process.env.FILE_NAME_TRIP_DATA;
      logger.info("Reading trips CSV to build cache")
      const path = `${process.cwd()}/${this.tripDataFileName}`;
      this.tripsByEndDate = {};
      csv()
        .fromFile(path)
        .subscribe((o) => {
          const endDate = moment(o['01 - Rental Details Local End Time']).format("MM/DD/YYYY");
          if(this.tripsByEndDate[endDate]){
            this.tripsByEndDate[endDate].push(o);
          } else {
            this.tripsByEndDate[endDate] = [o];
          }
        },(err)=> {
          logger.error(err)
          reject();
        }, ()=>{
          logger.info("Cache initialized for trips data, cache size is ", Object.keys(this.tripsByEndDate).length);
          this.cacheInitialized = true;
          resolve();
        })
    } )

  }

  async getRidersForDate (stations = [], date = moment()){
    const givenDate = date.format("MM/DD/YYYY");
    if(!this.cacheInitialized){
      await this.initTripsCache(); // Init cache if it is not initialized
    }
    if(this.tripsByEndDate[givenDate]){
      const trips = _.filter(this.tripsByEndDate[givenDate], (trip) => {
        const stationId = trip['02 - Rental End Station ID'];
        return _.includes(stations, stationId);
      });
      const currentYear = moment().format("YYYY");
      const groupedByAgeTrips =  _.reduce(trips, (result, value) => {
        const birthYear = value['05 - Member Details Member Birthday Year'];
        const ageOfRider = (currentYear - birthYear);
        if (ageOfRider <= 20) {
          result['0-20'] +=1;
        } else if (ageOfRider >= 21 && ageOfRider <= 30) {
          result['21-30'] +=1;
        } else if (ageOfRider >= 31 && ageOfRider <= 40) {
          result['31-40'] +=1;
        } else if (ageOfRider >= 41 && ageOfRider <= 50) {
          result['41-50'] +=1;
        }
        else if (ageOfRider >= 51) {
          result['51+'] +=1;
        }
        else {
          result['unknown'] +=1;
        }
        return result;
      }, _.clone(defaultTripsResponse))
      if(_.isEmpty(groupedByAgeTrips)){
        return defaultTripsResponse
      }
      return groupedByAgeTrips;
    }

    return defaultTripsResponse
  }
  async getLastTrips (stations = [], date = moment()){
    const givenDate = date.format("MM/DD/YYYY");
    if(!this.cacheInitialized){
      await this.initTripsCache(); // Init cache if it is not initialized
    }
    if(this.tripsByEndDate[givenDate]){
      const trips = _.filter(this.tripsByEndDate[givenDate], (trip) => {
        const stationId = trip['02 - Rental End Station ID'];
        return _.includes(stations, stationId);
      });
      const tripsByStation = _.groupBy(trips, (trip) => {
        const stationId = trip['02 - Rental End Station ID'];
        return stationId;
      })
      const endDate = '01 - Rental Details Local End Time';
      _.keys(tripsByStation).forEach((key)=>{
        let tripsForStation = tripsByStation[key].sort((a, b) => new Date(b[endDate]) - new Date(a[endDate])) // descending order
          .slice(0, 20);
        tripsByStation[key] = tripsForStation;
      })
      return tripsByStation;

    }

    return {}
  }

}

class Singleton {

  constructor() {
    if (!Singleton.instance) {
      Singleton.instance = new DataService();
    }
  }

  getInstance() {
    return Singleton.instance;
  }

}


module.exports = Singleton;
