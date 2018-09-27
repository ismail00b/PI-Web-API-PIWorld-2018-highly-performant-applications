"use strict";

// This StreamUpdates implementation makes use of the fact that re-registering for a
// resource which is already being monitored is very cheap to do, because the cache
// on the server already exists. By abusing this, and the knowledge that the marker will
// only change when an update occurs for the resource, we can continually re-register
// every time the DataQuery is called by the default polling logic.
class StreamUpdatesDataQuery extends IDataQuery {
    constructor() {
        super();
        this.markerList = [];
        this.needsPolling = false;
    }

    async DataQuery(config, selectedAttributes) {
        // Housekeeping - need to tell the rest of the application that we're
        // switching to StreamSet mode.
        this.resultType = "Single Call";

        // Check if we were already watching for updates and, if so, stop them.
        if (openedThread !== -1) {
            clearInterval(openedThread);
            openedThread = -1;
        }

        // Create an empty array of markers. The marker is how we tell the PI Web API
        // what resource we're watching for updates. The PI Web API knows which marker
        // corresponds to which set of updates.
        this.markerList = [];

        // Build the endpoint URL.
        let piwebapi = config.server;
        let url = `${piwebapi}/streamsets/updates`;

        // Add the WebIDs of the selected attributes to the Parameters collection.
        let parameters = new Parameters();
        selectedAttributes.map(attribute => parameters.append("webId", attribute.webId));

        // If we had any selected attributes,
        if (selectedAttributes.length > 0) {
            // POST our request, letting the PI Web API know that we want to watch
            // all the resources we specified for updates.
            let response = await Post(url + parameters, null);

            // Each item in the response has a marker: hold on to them for later, when we
            // ask the PI Web API for updates.
            response.Items.map(function (item) {
                this.markerList.push(item.LatestMarker);
            }.bind(this));
        }

        // Start up a thread to look for updates every so often.
        openedThread = setInterval(this.ReceiveUpdates.bind(this), config.updatePeriod, config);

        // Use StreamSet controller to get the initial set of data, just like we did for Channels.
        let streamSetQuery = new StreamSetsPlotDataQuery();
        let results = await streamSetQuery.DataQuery(config, selectedAttributes);
        return results;
    }

    async ReceiveUpdates(config) {
        // Housekeeping - need to tell the rest of the application that we're
        // switching to Stream Updates mode.
        this.resultType = "Stream Update";

        // Don't do anything if we have no markers.
        if (this.markerList.length === 0) {
            return;
        }

        // Build the endpoint URL.
        let piwebapi = config.server;
        let url = `${piwebapi}/streamsets/updates`;

        // Add all the markers we collected to Parameters collection.
        let parameters = new Parameters();
        this.markerList.map(marker => parameters.append("marker", marker));

        // GET the result - this is the changes (or lack thereof) since the time
        // that our marker was created.
        let results = await Get(url + parameters, null);

        // Each update gives us back a new marker to use next time; replace our list
        // of old markers with the new ones.
        this.markerList = results.Items.map(item => item.LatestMarker);

        // This is just to make sure that we don't accidentally end up with an empty marker.
        // This only happens if we encountered an error when asking for updates.
        this.markerList = this.markerList.filter(function (marker) { return marker !== ""; });

        // If there were any updates, add them to the graph.
        if (this.markerList.length !== 0) {
            AppendGraph(results);
        }
    }
}
