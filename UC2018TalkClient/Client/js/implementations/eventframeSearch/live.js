"use strict";

class LiveEventFrameSearch extends IEventFrameSearch {
    async EventFrameSearch(config, elementDTO) {
        let uri = undefined;

        return await Get(uri, true);
    }
}