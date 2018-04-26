"use strict";

class Stopwatch {
    constructor() {
        this.reset();
    }

    startOrContinue() {
        this.prevTime = new Date();
    }

    pause(key) {
        this.elapsedTimes.set(key, new Date() - this.prevTime);
    }

    reset() {
        this.prevTime = 0;
        this.elapsedTimes = new Map();
    }

    sum() {
        let values = this.elapsedTimes.values();
        let valueArray = Array.from(values);
        let result = valueArray.reduce((total, current) => total + current, 0);

        return result;
    }
}

var stopwatch_elementSearch_key = "elementSearch";
var stopwatch_attributeSearch_key = "attributeSearch";
var stopwatch_dataQuery_key = "dataQuery";
var stopwatch_eventFrameSearch_key = "eventFrameSearchQuery";