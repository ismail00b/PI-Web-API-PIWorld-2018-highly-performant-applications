"use strict";

class NewAttributeSearch extends IAttributeSearch {
    async AttributeSearch(config, elementDTO, query) {
        let attributeName = query;
        let elementName = elementDTO.name;
        let database = config.databaseWebId;
        let piwebapi = config.server;

        let url = `${piwebapi}/attributes/search`;
        let parameters = new Parameters();

        parameters.set("databaseWebId", database);
        parameters.set("query", `Name:${attributeName} Element:{Name:'${elementName}'}`);
        parameters.set("selectedFields", "Items.Name;Items.WebID;Items.Path");

        let results = await Get(url + parameters, true);
        return results;
    }
}