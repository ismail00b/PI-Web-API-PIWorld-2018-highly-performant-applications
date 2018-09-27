"use strict";

class ChannelDataQuery extends IDataQuery {
    constructor() {
        super();
        this.needsPolling = false;
    }

    async DataQuery(config, selectedAttributes) {
        // For each selected attribute,
        selectedAttributes.map(function (attributeDTO) {
            // Get the attributes WebID.
            let webId = attributeDTO.webId;

            // If we don't already have a WebSocket open for that attribute,
            if (!openWebsockets[webId]) {
                // Create a new WebSocket.
                // Note that we use the Stream controller here. This is because our application
                // commonly selects or deselects attributes. This is significant because the
                // StreamSet Channels cannot have their subscriptions modified after they're opened.
                // Your application may benefit from using StreamSet Channels instead of many Stream
                // Channels, if the set of watched resources changes infrequently.
                let webSocket = new WebSocket(`wss:/${config.host}/piwebapi/streams/${webId}/channel`);

                // Set up the WebSocket so that we log a message when it opens.
                webSocket.onopen = function (event) {
                    console.log("Opened websocket for " + webId);
                };

                // Set up the WebSocket so that we log a message when it has an error.
                webSocket.onerror = function (event) {
                    console.log("Error occurred in websocket for " + webId);
                };

                // Set up the WebSocket so that we log a message when it closes.
                webSocket.onclose = function (event) {
                    console.log("Closed websocket for " + webId);
                };

                // Set up the WebSocket so that we log a message when it opens, and updates the graph.
                webSocket.onmessage = function (event) {
                    // Housekeeping - let the rest of the application know we're switching to Channels mode.
                    currentDataImplementation.resultType = "Channel";

                    console.log("New data for:\n" + webId);

                    // Our application only deals with data being added. If your use case can result
                    // in data being updated or removed, those events would also occur here. We don't
                    // have to worry about that, so we just append all changes to the graph.
                    AppendGraph(JSON.parse(event.data));
                }.bind(this);

                // Hold onto the WebSocket for later.
                openWebsockets[webId] = webSocket;
            }
        });

        // After we open the WebSockets, make a StreamSet request to populate the chart with historical data.
        // We need to do this _after_ we open the WebSockets, because otherwise we might miss some data.
        let streamSetQuery = new StreamSetsPlotDataQuery();
        let results = await streamSetQuery.DataQuery(config, selectedAttributes);

        this.resultType = "Single Call";
        return results;
    }

    // This function gets called whenever the user selects an attribute.
    async HandleAttributeAddition(config, attributeDTO, selectedAttributes) {
        return await this.DataQuery(config, selectedAttributes);
    }

    // This function gets called whenever the user deselects an attribute.
    async HandleAttributeRemoval(config, attributeDTO, selectedAttributes) {
        // If the attribute that they deselected had a WebSocket open,
        if (openWebsockets[attributeDTO.webId]) {
            // Close the WebSocket, and remove it from the list of WebSockets.
            openWebsockets[attributeDTO.webId].close();
            delete openWebsockets[attributeDTO.webId];
        }

        return await this.DataQuery(config, selectedAttributes);
    }
}