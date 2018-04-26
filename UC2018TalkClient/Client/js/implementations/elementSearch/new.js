"use strict";

class NewElementSearch extends IElementSearch {
    async ElementSearch(config, query) {
        let elementName = query;
        let templateName = config.carTemplateName;
        let rootName = config.rootElementName;
        let database = config.databaseWebId;
        let piwebapi = config.server;

        let url = `${piwebapi}/elements/search`;
        let parameters = new Parameters();

        parameters.set("databaseWebId", database);
        parameters.set("query", `Name:="${query}" TemplateName:="${templateName}" Root:="${rootName}"`);
        parameters.set("selectedFields", "Items.Name;Items.Links.Attributes;Items.WebID");

        let results = await Get(url + parameters, true);
        return results;
    }
}