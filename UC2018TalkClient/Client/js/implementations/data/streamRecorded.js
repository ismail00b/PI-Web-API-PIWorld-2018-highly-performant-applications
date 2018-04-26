"use strict";

class StreamRecordedDataQuery extends IDataQuery {
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

        // Build up our parameters.
        let parameters = new Parameters();
        parameters.set("startTime", startTime);
        parameters.set("endTime", endTime);
        parameters.set("maxCount", maxCount);

        // For each selected attribute,
        let results = await AsyncForEach(
            selectedAttributes,
            async attributeDTO => {
                // Create the URL for the Stream controller's Recorded endpoint for that attribute.
                let webId = attributeDTO.webId;
                let url = `${piwebapi}/streams/${webId}/recorded`;

                // GET the Recorded data.
                return await Get(url + parameters, true);
            });

        // Return the results - this is the Recorded data for all of the selected attributes.
        // If you look at this object in the debugger, it is an array - not a single JSON object.
        return results;
    }
}
