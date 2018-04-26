"use strict";

class OldEventFrameSearch extends IEventFrameSearch {
    async EventFrameSearch(config, elementDTO) {
        let elementWebId = elementDTO.webId;
        let templateName = config.efTemplateName;
        let startTime = config.startTime;
        let endTime = config.endTime;
        let piwebapi = config.server;

        let url = `${piwebapi}/elements/${elementWebId}/eventframes`;
        let parameters = new Parameters();

        parameters.set("templateName", templateName);
        parameters.set("startTime", startTime);
        parameters.set("endTime", endTime);

        let results = await Get(url + parameters, true);
        return results;
    }
}