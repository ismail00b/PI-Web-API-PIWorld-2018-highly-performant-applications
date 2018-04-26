"use strict";

class OldAttributeSearch extends IAttributeSearch {
    async AttributeSearch(config, elementDTO, query) {
        let attributeName = query;
        let elementWebId = elementDTO.webId;
        let templateName = config.carTemplateName;
        let searchFullHierarchy = true;
        let piwebapi = config.server;

        let url = `${piwebapi}/elements/${elementWebId}/attributes`;
        let parameters = new Parameters();

        parameters.set("nameFilter", attributeName);
        parameters.set("templateName", templateName);
        parameters.set("searchFullHierarchy", searchFullHierarchy);

        let results = await Get(url + parameters, true);
        return results;
    }
}