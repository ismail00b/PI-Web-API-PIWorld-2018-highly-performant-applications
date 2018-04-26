"use strict";

class StreamPlotDataQuery extends IDataQuery {
    constructor() {
        super();
        this.resultType = "Multiple Calls";
    }

    async DataQuery(config, selectedAttributes) {
        // Collect required information from the configuration object.
        let piwebapi = config.server;
        let startTime = config.startTime;
        let endTime = config.endTime;
        let maxCount = config.maxCount;
        let intervals = config.intervals; // Note that we have a new parameter, 'intervals'.

        // Build up our parameters.
        let parameters = new Parameters();
        parameters.set("startTime", startTime);
        parameters.set("endTime", endTime);
        parameters.set("maxCount", maxCount);
        parameters.set("intervals", intervals);

        // For each selected attribute,
        let results = await AsyncForEach(
            selectedAttributes,
            async attributeDTO => {
                // Create the URL for the Stream controller's Plot endpoint for that attribute.
                let webId = attributeDTO.webId;
                let url = `${piwebapi}/streams/${webId}/plot`;

                // GET the Plot data.
                return await Get(url + parameters, true);
            });

        // Return the results - this is the Plot data for all of the selected attributes.
        // If you look at this object in the debugger, it is an array - not a single JSON object.
        return results;
    }
}