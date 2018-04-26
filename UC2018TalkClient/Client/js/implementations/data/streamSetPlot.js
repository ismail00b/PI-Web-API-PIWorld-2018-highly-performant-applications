"use strict";

class StreamSetsPlotDataQuery extends IDataQuery {
    constructor() {
        super();
        this.resultType = "Single Call";
    }

    async DataQuery(config, selectedAttributes) {
        // If we don't have any selected attributes, don't do anything.
        if (selectedAttributes.length === 0) {
            return [];
        }

        // Collect required information from the configuration object.
        let piwebapi = config.server;
        let startTime = config.startTime;
        let endTime = config.endTime;
        let maxCount = config.maxCount;
        let intervals = config.intervals;

        // Build up our parameters.
        let parameters = new Parameters();
        parameters.set("startTime", startTime);
        parameters.set("endTime", endTime);
        parameters.set("maxCount", maxCount);
        parameters.set("intervals", intervals);

        // Add all the WebIDs to the AdHoc call's parameters.
        selectedAttributes.map(attributeDTO => parameters.append("webId", attributeDTO.webId));

        // Create the URL for the StreamSet controller's Plot endpoint.
        let url = `${piwebapi}/streamsets/plot`;

        // GET the Plot data for all of the attributes.
        let results = await Get(url + parameters, false);

        // Return the results; this contains all of the data for all the attributes.
        // If you look at this object in the debugger, it is a single JSON object - not an array.
        return results;
    }
}