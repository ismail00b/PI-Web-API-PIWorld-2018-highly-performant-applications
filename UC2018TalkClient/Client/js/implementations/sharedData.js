"use strict";

var currentAttributeImplementation;
var currentElementImplementation;
var currentEventFrameImplementation;
var currentDataImplementation;

var seconds = (x) => 1000 * x;

var AsyncForEach = (collection, callback) => Promise.all(collection.map(callback));

class Config {
    constructor() {
        this.databaseWebId = "F1RDDqD5loBNH0erqeqJodtALAf2V-9YjZ1kCXy4n-cI2xfQUkVTVFVOSVRcUElXT1JMRDIwMTg";
        this.rootElementName = "Fleet";
        this.rootElementWebId = "F1EmDqD5loBNH0erqeqJodtALAbHNRrfwb6BGXZLgIz0QpeAUkVTVFVOSVRcUElXT1JMRDIwMThcRkxFRVQ";
        this.carTemplateName = "Fleet Car Template";
        this.efTemplateName = "Running Event";
        this.host = "localhost";
        this.server = "https://" + this.host + "/piwebapi";
        this.updatePeriod = seconds(5);

        let retrievedStartTime = $("#start-time")[0].value;
        let retrievedEndTime = $("#end-time")[0].value;
        let retrievedMaxCount = $("#max-count")[0].value;
        let retrievedIntervals = $("#intervals")[0].value;

        this.startTime = retrievedStartTime === "" ? "*-1d" : retrievedStartTime;
        this.endTime = retrievedEndTime === "" ? "*" : retrievedEndTime;
        this.maxCount = retrievedMaxCount === "" ? 150000 : parseInt(retrievedMaxCount);
        this.intervals = retrievedIntervals === "" ? 24 : parseInt(retrievedIntervals);
    }
}

var openWebsockets = {};

var openedThread = -1;

var events = [];

var implementationHistory = {
    lastImpl: {},
    currentImpl: {}
};