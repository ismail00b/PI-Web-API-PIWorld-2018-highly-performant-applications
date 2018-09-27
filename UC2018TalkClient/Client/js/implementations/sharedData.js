"use strict";

var currentAttributeImplementation;
var currentElementImplementation;
var currentEventFrameImplementation;
var currentDataImplementation;

var seconds = (x) => 1000 * x;

var AsyncForEach = (collection, callback) => Promise.all(collection.map(callback));

class Config {
    constructor() {
        // Replace the databaseWebId and rootElementWebId variables with the Web IDs for your database and root element.
        this.databaseWebId = "F1RDdWzytWZcXEuey30pa60F1AGfH696mdRUKiwGHx2Rn6-wUElXT1JMRFRBTEtERU1PXFBJV09STEQyMDE4";
        this.rootElementWebId = "F1EmdWzytWZcXEuey30pa60F1AH0ZTgoor6BGeHgANOjrcOwUElXT1JMRFRBTEtERU1PXFBJV09STEQyMDE4XEZMRUVU";

        this.rootElementName = "Fleet";
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

var openWebsockets = [];

var openedThread = -1;

var pollingInterval = -1;

var updatesRunning = false;

var events = [];

var implementationHistory = {
    lastImpl: {},
    currentImpl: {}
};