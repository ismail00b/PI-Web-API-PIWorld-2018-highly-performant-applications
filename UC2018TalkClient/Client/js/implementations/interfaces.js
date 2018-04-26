"use strict";

class IAttributeSearch {
    constructor(name) {
        this.name = name;
    }

    async AttributeSearch(serverConfig, elementDTO, query) {

    }

    async AttributeSearch(serverConfig, query) {

    }
}

class IElementSearch {
    constructor(name) {
        this.name = name;
    }

    async ElementSearch(serverConfig, query) {

    }
}

class IEventFrameSearch {
    constructor(name) {
        this.name = name;
    }

    async EventFrameSearch(serverConfig, query) {

    }
}

class IDataQuery {
    constructor(name) {
        this.name = name;
        this.needsPolling = true;
        this.resultType = undefined;
    }

    async DataQuery(serverConfig, selectedAttributes) {

    }

    async HandleAttributeAddition(serverConfig, attributeDTO, selectedAttributes) {
        return await this.DataQuery(serverConfig, selectedAttributes);
    }

    async HandleAttributeRemoval(serverConfig, attributeDTO, selectedAttributes) {
        return await this.DataQuery(serverConfig, selectedAttributes);
    }
}