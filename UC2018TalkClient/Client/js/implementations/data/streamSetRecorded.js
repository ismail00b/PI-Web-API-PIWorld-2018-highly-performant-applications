"use strict";

class StreamSetsRecordedDataQuery extends IDataQuery {
    constructor() {
        super();
        this.resultType = "Single Call";
    }

    async DataQuery(config, selectedAttributes) {
        // This data query isn't shown in the client application, but we use it
        // for the Channels and Stream Updates data queries. This is because when
        // we get updates, we draw the data straight to the graph. If we don't use
        // recorded values when doing this, our graph ends up being nonsense: for
        // example, if the initial call was Plot data, then when we start receiving
        // updates, our graph switches from Plot data to Recorded data without any
        // indication.

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

        // Add all the WebIDs to the AdHoc call's parameters.
        selectedAttributes.map(attributeDTO => parameters.append("webId", attributeDTO.webId));

        let url = `${piwebapi}/streamsets/recorded`;

        let result = await Get(url + parameters, false);

        return result;
    }
}