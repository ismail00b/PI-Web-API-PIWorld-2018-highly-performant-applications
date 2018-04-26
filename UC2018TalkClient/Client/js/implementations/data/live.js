"use strict";

class LiveDataQuery extends IDataQuery {
    constructor() {
        super();
        //this.needsPolling = false;
    }

    async DataQuery(config, selectedAttributes) {
        // This method just controls which underlying implementation we call.

        //let results = await this.streamRecorded(config, selectedAttributes);
        let results = await this.streamPlot(config, selectedAttributes);
        //let results = await this.streamSetPlot(config, selectedAttributes);
        //let results = await this.batch(config, selectedAttributes);

        return results;
    }

    async streamRecorded(config, selectedAttributes) {
        // This method is the live coding example for the Stream controller's Recorded endpoint.
        this.resultType = "Multiple Calls";

        let piwebapi = config.server;
        let startTime = config.startTime;
        let endTime = config.endTime;
        let maxCount = config.maxCount;

        let parameters = new Parameters();
        parameters.set("startTime", startTime);
        parameters.set("endTime", endTime);
        parameters.set("maxCount", maxCount);

        let results = await AsyncForEach(
            selectedAttributes,
            async attributeDTO => {
                let webId = attributeDTO.webId;
                let url = `${piwebapi}/streams/${webId}/recorded`;

                return await Get(url + parameters, true);
            });

        return results;
    }

    async streamPlot(config, selectedAttributes) {
        // This method is the live coding example for the Stream controller's Plot endpoint.
        this.resultType = "Multiple Calls";

        let piwebapi = config.server;
        let startTime = config.startTime;
        let endTime = config.endTime;
        let maxCount = config.maxCount;
        let intervals = config.intervals; // Note that we have a new parameter, 'intervals'.
        
        let parameters = new Parameters();
        parameters.set("startTime", startTime);
        parameters.set("endTime", endTime);
        parameters.set("maxCount", maxCount);
        parameters.set("intervals", intervals);

        let results = await AsyncForEach(
            selectedAttributes,
            async attributeDTO => {
                let webId = attributeDTO.webId;
                let url = `${piwebapi}/streams/${webId}/plot`;
                
                return await Get(url + parameters, true);
            });
        
        return results;
    }

    async streamSetPlot(config, selectedAttributes) {
        // This method is the live coding example for the StreamSet controller's Plot endpoint.
        this.resultType = "Single Call";

        // Housekeeping - if we don't have any selected attributes, don't do anything.
        if (selectedAttributes.length === 0) {
            return [];
        }

        let piwebapi = config.server;
        let startTime = config.startTime;
        let endTime = config.endTime;
        let maxCount = config.maxCount;
        let intervals = config.intervals;
        
        let parameters = new Parameters();
        parameters.set("startTime", startTime);
        parameters.set("endTime", endTime);
        parameters.set("maxCount", maxCount);
        parameters.set("intervals", intervals);

        selectedAttributes.map(attributeDTO => {
            //parameters.append("webId", attributeDTO.webId)
        });

        let url = `${piwebapi}/streamsets/plot`;

        let results = await Get(url + parameters, false);

        return results;
    }

    async batchDataQuery(config, selectedAttributes) {
        // This method is the live coding example for the Batch controller.
        this.resultType = "Batch";

        let piwebapi = config.server;
        let startTime = config.startTime;
        let endTime = config.endTime;
        let maxCount = config.maxCount;
        let intervals = config.intervals;

        let parameters = new Parameters();
        parameters.set("startTime", startTime);
        parameters.set("endTime", endTime);
        parameters.set("maxCount", maxCount);
        parameters.set("intervals", intervals);

        //let batchSubRequests = {};
        selectedAttributes.map((attribute, index) => {
            //let url = `${piwebapi}/streams/${attribute.webId}/plot`;
            
            batchSubRequests[index] = {
                //"Method": "GET",
                //"Resource": url + parameters,
                "Headers": {
                    "Cache-Control": "no-cache",
                    "Access-Control-Allow-Origin": "*"
                }
            };
        });

        let result = await Post(`${piwebapi}/batch`, batchSubRequests);

        return result;
    }
}
