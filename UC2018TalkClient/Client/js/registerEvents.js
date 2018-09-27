"use strict";

function stopAutomaticUpdates() {
    if (pollingInterval !== -1) {
        clearInterval(pollingInterval);
    }
    if (openedThread !== -1) {
        clearInterval(openedThread);
    }

    Object.values(openWebsockets).map(socket => {
        socket.close();
    });
    openWebsockets = [];

    let retVal = updatesRunning;
    updatesRunning = false;

    return retVal;
}

function startAutomaticUpdates(triggerDataCall) {
    let config = new Config();

    if (currentDataImplementation.needsPolling) {
        pollingInterval = setInterval(
            () => {
                currentDataImplementation
                    .DataQuery(config, selectedAttributes)
                    .then(result => DrawGraph(TransformData(currentDataImplementation.resultType, result)));
            },
            config.updatePeriod);
    }

    if (triggerDataCall) {
        currentDataImplementation
            .DataQuery(config, selectedAttributes)
            .then(result => DrawGraph(TransformData(currentDataImplementation.resultType, result)));
    }

    updatesRunning = true;
}

$(document.body).ready(() => {

    if (localStorage["history"]) {
        $("#history").html(localStorage["history"]);
    }

    if (localStorage["start-time"]) {
        $("#start-time").val(localStorage["start-time"]);
    }

    if (localStorage["end-time"]) {
        $("#end-time").val(localStorage["end-time"]);
    }

    if (localStorage["intervals"]) {
        $("#intervals").val(localStorage["intervals"]);
    }

    if (localStorage["max-count"]) {
        $("#max-count").val(localStorage["max-count"]);
    }

    $(".graph-input").on('input', function (event) {
        localStorage[event.target.id] = $(event.target).val();
    });

    $(".accordion").on("click", function (event) {
        $(".attribute-panel:not('#" + $(this).attr("id").split("-")[0] + "-panel')").slideUp("ease");
        $(this).next().slideToggle("ease");
        let $arrow = $(this).children().first();
        $arrow.toggleClass("turn");
        $(".accordion:not('#" + $(this).attr("id") + "')").children().removeClass("turn");

        $(".accordion").removeClass("selected");
        $(this).addClass("selected");
    });

    $("#attribute-picker").keypress(event => {
        if (event.originalEvent.code === "Enter") {
            AttributeSearch(selectedElement);
            hideSearch();
        }
    });

    $("#element-picker").keypress(event => {
        if (event.originalEvent.code === "Enter") {
            ElementSearch();
            hideSearch();
        }
    });

    $(".search-button").click(function () {
        if ($(this).parent().attr("id").split("-")[0] === "element") {
            ElementSearch();
            hideSearch();
        }
        else if ($(this).parent().attr("id").split("-")[0]==="attribute"){
            AttributeSearch(selectedElement);
            hideSearch();
        }
    });

    $("#eventframes-checkbox").click(event => {
        $(event.target).toggleClass("selected");
        chart.redraw();
    });

    $("#refresh-checkbox").click(event => {
        $(event.target).toggleClass("selected");

        stopAutomaticUpdates();

        if ($(event.target).hasClass("selected")) {
            startAutomaticUpdates(true);
        }
    });

    $("#reexecute").click(async event => {
        if ($("#eventframes-checkbox").hasClass("selected")) {
            await EventFrameSearch(selectedElement, false);
        }

        await GetData();
    });

    $("#clear-history").click(async event => {
        localStorage.removeItem("history");
        ClearHistoryPanel();
        ClearChart();
        stopAutomaticUpdates();
        $("#refresh-checkbox").removeClass("selected");
    });

    $("#element-search-button").click(() => {
        ElementSearch();
    });

    $("#attribute-search-button").click(() => {
        AttributeSearch();
    });

    $("#attribute-search-similar-button").click(() => {
        AttributeSearchSimilar();
    });

    //Finder
    $("#attribute-tab").click(() => {
        $(".search").hide();
        $("#attribute-picker").show();
    });

    $("#element-tab").click(function () {
        $(".search").hide();
        $("#element-picker").show();
    });

    $("#eventframe-tab").click(() => {
        $(".search").hide();
        $("#eventframe-picker").show();
    });

    //Implementations
    $("#attribute-impl").click(() => {
        $("#attribute-implementation-picker").show();
        $("#attribute-impl").addClass("selected");

        $("#element-implementation-picker").hide();
        $("#element-impl").removeClass("selected");

        $("#data-implementation-picker").hide();
        $("#data-impl").removeClass("selected");

        $("#eventframe-implementation-picker").hide();
        $("#eventframe-impl").removeClass("selected");
    });

    $("#element-impl").click(() => {
        $("#attribute-implementation-picker").hide();
        $("#attribute-impl").removeClass("selected");

        $("#element-implementation-picker").show();
        $("#element-impl").addClass("selected");

        $("#data-implementation-picker").hide();
        $("#data-impl").removeClass("selected");

        $("#eventframe-implementation-picker").hide();
        $("#eventframe-impl").removeClass("selected");
    });

    $("#data-impl").click(() => {
        $("#attribute-implementation-picker").hide();
        $("#attribute-impl").removeClass("selected");

        $("#element-implementation-picker").hide();
        $("#element-impl").removeClass("selected");

        $("#data-implementation-picker").show();
        $("#data-impl").addClass("selected");

        $("#eventframe-implementation-picker").hide();
        $("#eventframe-impl").removeClass("selected");
    });

    $("#eventframe-impl").click(() => {
        $("#attribute-implementation-picker").hide();
        $("#attribute-impl").removeClass("selected");

        $("#element-implementation-picker").hide();
        $("#element-impl").removeClass("selected");

        $("#data-implementation-picker").hide();
        $("#data-impl").removeClass("selected");

        $("#eventframe-implementation-picker").show();
        $("#eventframe-impl").addClass("selected");
    });

    // Attribute Pickers
    AddImplementationOption(
        "attribute",
        "#badAttributePicker",
        "Bad Attribute Picker",
        x => {
            currentAttributeImplementation = new OldAttributeSearch(x);
        });
    AddImplementationOption(
        "attribute",
        "#betterAttributePicker",
        "Better Attribute Picker",
        x => {
            currentAttributeImplementation = new NewAttributeSearch(x);
        });

    // Element Pickers
    AddImplementationOption(
        "element",
        "#badElementPicker",
        "Bad Element Picker",
        x => {
            currentElementImplementation = new OldElementSearch(x);
        });
    AddImplementationOption(
        "element",
        "#betterElementPicker",
        "Better Element Picker",
        x => {
            currentElementImplementation = new NewElementSearch(x);
        });

    // EventFrame Pickers
    AddImplementationOption(
        "eventframe",
        "#badEventFramePicker",
        "Bad EventFrame Picker",
        x => {
            currentEventFrameImplementation = new OldEventFrameSearch(x);
        });
    AddImplementationOption(
        "eventframe",
        "#betterEventFramePicker",
        "Better EventFrame Picker",
        x => {
            currentEventFrameImplementation = new NewEventFrameSearch(x);
        });

    // Data Queries
    AddImplementationOption(
        "data",
        "#streamDataCalls",
        "Multiple Stream Recorded",
        x => {
            currentDataImplementation = new StreamRecordedDataQuery(x);
        });
    AddImplementationOption(
        "data",
        "#plotDataCalls",
        "Multiple Stream Plot",
        x => {
            currentDataImplementation = new StreamPlotDataQuery(x);
        });
    AddImplementationOption(
        "data",
        "#streamsetsDataCalls",
        "StreamSet Plots",
        x => {
            currentDataImplementation = new StreamSetsPlotDataQuery(x);
        });
    AddImplementationOption(
        "data",
        "#batchDataCalls",
        "Batch Plot",
        x => {
            currentDataImplementation = new BatchDataQuery(x);
        });
    AddImplementationOption(
        "data",
        "#channelDataCalls",
        "Channels",
        x => {
            currentDataImplementation = new ChannelDataQuery(x);
        });
    AddImplementationOption(
        "data",
        "#streamUpdateDataCalls",
        "Stream Updates",
        x => {
            currentDataImplementation = new StreamUpdatesDataQuery(x);
        });

    // Live Coding
    AddImplementationOption(
        "data",
        "#liveDataCall",
        "Live Coding",
        x => {
            currentDataImplementation = new LiveDataQuery(x);
        });
    AddImplementationOption(
        "attribute",
        "#liveAttributeSearchCall",
        "Live Coding",
        x => {
            currentDataImplementation = new LiveAttributeSearch(x);
        });
    AddImplementationOption(
        "element",
        "#liveElementSearchCall",
        "Live Coding",
        x => {
            currentDataImplementation = new LiveElementSearch(x);
        });
    AddImplementationOption(
        "eventframe",
        "#liveEventFrameCall",
        "Live Coding",
        x => {
            currentDataImplementation = new LiveEventFrameSearch(x);
        });

    $(".search-form").focus(function () {
        showSearch();
    });
    $(".search-form").focusout(function () {
        hideSearch();
    });

    $(window).resize(function () {
        chart.redraw();
    });
});