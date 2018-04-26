"use strict";

class Parameters {
    constructor() {
        this.backing = new URLSearchParams();
    }

    append(name, value) {
        this.backing.append(name, value);
    }

    set(name, value) {
        this.backing.set(name, value);
    }

    toString() {
        return `?${this.backing.toString()}`;
    }
}