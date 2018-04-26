"use strict";

class LiveElementSearch extends IElementSearch {
    async ElementSearch(config, query) {
        let uri = undefined;

        return await Get(uri, true);
    }
}