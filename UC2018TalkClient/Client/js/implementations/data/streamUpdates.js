"use strict";

class StreamUpdatesDataQuery extends IDataQuery {
    constructor() {
        super();
        this.markerDictionary = {};
        this.needsPolling = false;
    }

    async DataQuery(config, selectedAttributes, checkForUpdates = true) {
        // Housekeeping - need to tell the rest of the application that we're
        // switching to StreamSet mode.
        this.resultType = "Single Call";

        // Housekeeping - if this method was called by outside code, we need to do
        // a bunch of setup to make sure our internal state is correct.
        if (checkForUpdates) {
            // Check if we were already watching for updates and, if so, stop them.
            if (openedThread !== -1) {
                clearInterval(openedThread);
                openedThread = -1;
            }

            // If there aren't any selected attributes, don't do anything.
            if (selectedAttributes.length === 0) {
                return [];
            }

            // Create the URI to register for updates on the selected attributes.
            let piwebapi = config.server;
            let url = `${piwebapi}/streamsets/updates`;
            let parameters = new Parameters();
            selectedAttributes.map(attributeDTO => parameters.append("webId", attributeDTO.webId));

            // Register the attributes for updates.
            let results = await Post(url + parameters, null);

            // Update our list of markers.
            results.Items.map(
                function (item) {
                    this.markerDictionary[item.Source] = item.LatestMarker;
                }.bind(this)
            );

            // Start up a thread to look for updates every so often.
            openedThread = setInterval(this.ReceiveUpdates.bind(this), config.updatePeriod, config);
        }

        // Use StreamSet controller to get the set of data, just like we did for Channels.
        let streamSetQuery = new StreamSetsPlotDataQuery();
        let results = await streamSetQuery.DataQuery(config, selectedAttributes);
        return results;
    }

    async ReceiveUpdates(config) {
        // Housekeeping - need to tell the rest of the application that we're
        // switching to Stream Updates mode.
        this.resultType = "Stream Update";

        // Turn our marker dictionary into an array.
        let markers = Array.from(Object.values(this.markerDictionary).length);

        // Don't do anything if we have no markers.
        if (markers.length === 0) {
            return;
        }

        // Build the endpoint URL.
        let piwebapi = config.server;
        let url = `${piwebapi}/streamsets/updates`;

        // Add all the markers we collected to Parameters collection.
        let parameters = new Parameters();
        this.markers.map(marker => parameters.append("marker", marker));

        // GET the result - this is the changes (or lack thereof) since the time
        // that our marker was created.
        let results = await Get(url + parameters, null);

        // For each of the updates we get back, update the marker we have for that resource
        // with the latest marker. Also, let us know that an update happened.
        let updateExisted = false;
        results.Items.map(
            function (item) {
                this.markerDictionary[item.Source] = item.LatestMarker;
                updateExisted = true;
            }.bind(this)
        );

        // **At this point, we've retrieved any/all updates. Updates can include
        // data being added, changed, or removed. This example application just
        // appends all changes to the graph - yours might do something more complex.**
        if (updateExisted) {
            AppendGraph(results);
        }
    }

    // This function gets called whenever the user selects an attribute.
    async HandleAttributeAddition(config, attributeDTO, selectedAttributes) {
        // Build up the URI to register for updates on the selected attribute.
        let piwebapi = config.server;
        let url = `${piwebapi}/streamsets/updates`;
        let parameters = new Parameters();
        parameters.set("webId", attributeDTO.webId);

        // POST our request, letting the PI Web API know that we want to watch
        // all the resources we specified for updates.
        let response = await Post(url + parameters, null);

        // For each item we just registered, add the marker PI Web API returns
        // to the list of markers we're watching.
        response.Items.map(item => {
            // If an error occurred, we won't have a latest marker.
            if (item.LatestMarker !== "") {
                this.markerDictionary[item.Source] = item.LatestMarker;
            }
        });

        // Execute a DataQuery to redraw the graph, so that our new attribute shows up on it.
        return await this.DataQuery(config, selectedAttributes, false);
    }

    // This function gets called whenever the user deselects an attribute.
    async HandleAttributeRemoval(config, attributeDTO, selectedAttributes) {
        // Remove the selected item from the list of markers we're watching.
        delete this.markerDictionary[attributeDTO.webId];

        // Execute a DataQuery to flush the removed item from the graph.
        return await this.DataQuery(config, selectedAttributes, false);
    }
}