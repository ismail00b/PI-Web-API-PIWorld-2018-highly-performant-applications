"use strict";

class BatchDataQuery extends IDataQuery {
    constructor() {
        super();
        this.resultType = "Batch";
    }

    async DataQuery(config, selectedAttributes) {
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

        // First, we create an empty Batch request.
        let batchSubRequests = {};

        // Then, for each selected attribute,
        selectedAttributes.map((attribute, index) => {
            // We create the URL to the Stream controller's Plot endpoint for that attribute.
            let url = `${piwebapi}/streams/${attribute.webId}/plot`;

            // Then, we create a subrequest for that URL, and put it into the batch request.
            batchSubRequests[index] = {
                "Method": "GET",
                "Resource": url + parameters,
                "Headers": {
                    "Cache-Control": "no-cache",
                    "Access-Control-Allow-Origin": "*"
                }
            };
        });

        // Finally, we POST our request, which lets the PI Web API execute it.
        let result = await Post(`${piwebapi}/batch`, batchSubRequests);

        return result;
    }
}