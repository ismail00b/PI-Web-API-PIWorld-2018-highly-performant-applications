"use strict";

class LiveAttributeSearch extends IAttributeSearch {
    async AttributeSearch(config, elementDTO, query) {
        let uri = undefined;

        return await Get(uri, true);
    }
}