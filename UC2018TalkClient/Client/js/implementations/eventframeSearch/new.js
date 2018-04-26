"use strict";

class NewEventFrameSearch extends IEventFrameSearch {
    async EventFrameSearch(config, elementDTO) {
        let elementName = elementDTO.name;
        let templateName = config.efTemplateName;
        let startTime = config.startTime;
        let endTime = config.endTime;
        let database = config.databaseWebId;
        let piwebapi = config.server;

        let url = `${piwebapi}/eventframes/search`;
        let parameters = new Parameters();

        parameters.set("databaseWebId", database);
        parameters.set("query", `name:=* start:>${startTime} end:<${endTime} elementName:="${elementName}" templateName:="${templateName}"`);
        
        let results = await Get(url + parameters, true);
        return results;
    }
}