"use strict";

class OldElementSearch extends IElementSearch {
    async ElementSearch(config, query) {
        let elementName = query;
        let templateName = config.carTemplateName;
        let searchFullHierarchy = true;
        let rootElement = config.rootElementWebId;
        let piwebapi = config.server;

        let url = `${piwebapi}/elements/${rootElement}/elements`;
        let parameters = new Parameters();

        parameters.set("nameFilter", elementName);
        parameters.set("templateName", templateName);
        parameters.set("searchFullHierarchy", searchFullHierarchy);

        let results = await Get(url + parameters, true);
        return results;
    }
}