"use strict";

class AttributeDTO {
    constructor(responseObject) {
        let parent = responseObject.Path.substring(responseObject.Path.lastIndexOf('\\') + 1, responseObject.Path.lastIndexOf('|'));
        this.name = parent + "." + responseObject.Name;
        this.webId = responseObject.WebId;
        this.path = responseObject.path;
        this.id = responseObject.Id;
        this.type = responseObject.Type;
    }
}

class ElementDTO {
    constructor(responseObject) {
        this.name = responseObject.Name;
        this.webId = responseObject.WebId;
        this.path = responseObject.Path;
        this.id = responseObject.Id;
    }
}

class EventFrameDTO {
    constructor(responseObject) {
        this.name = responseObject.Name;
        this.startTime = responseObject.StartTime;
        this.endTime = responseObject.EndTime;
        this.webId = responseObject.WebId;
        this.path = responseObject.Path;
        this.id = responseObject.Id;
    }
}

class AttributeValueDTO {
    constructor(responseObject) {
        this.timestamp = responseObject.Timestamp;
        this.value = responseObject.Value;
        this.good = responseObject.Good;
    }
}

class ChartDataDTO {
    constructor(responseObject) {
        this.Name = responseObject.Name;
        this.Items = responseObject.Items;
    }
}