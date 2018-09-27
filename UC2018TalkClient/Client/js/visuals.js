"use strict";

function PopulateAttributes(attributes) {
    let attributePanel = $("#attribute-panel");
    attributePanel.empty();
    selectedAttributes = [];
    $.each(attributes, (i, x) => AppendAttribute(x));
}

function CreateEventFrame(eventFrameDTO) {
    let container = document.createElement("div");
    container.className = "attribute-container";

    let name = document.createElement("div");
    name.className = "attribute-name attribute-text";
    name.innerHTML = eventFrameDTO.name;

    container.append(name);

    return container;
}

function DeselectElement(elementDTO) {
    $.each($("#element-panel div"), (i, x) => $(x).removeClass("selected"));
    selectedElement = {};
    events = [];
    DrawGraph([]);

    let attributePanel = $("#attribute-panel");
    attributePanel.empty();

    stopAutomaticUpdates();
}

function CreateElement(elementDTO) {
    let container = document.createElement("div");
    container.className = "attribute-container";

    let name = document.createElement("div");
    name.className = "attribute-name attribute-text";
    name.innerHTML = elementDTO.name;

    container.append(name);

    $(container).click(async evt => {
        if ($(container).hasClass("selected")) {
            DeselectElement(elementDTO);
        }
        else {
            events = [];
            DrawGraph([]);
            $.each($("#element-panel div"), (i, x) => $(x).removeClass("selected"));
            $(container).addClass("selected");

            selectedElement = elementDTO;

            await AttributeSearch(elementDTO);
            $("#attribute-tab").click();
            await EventFrameSearch(elementDTO);
        }
        
    });

    return container;
}

function CreateAttribute(attributeDTO) {
    let container = document.createElement("div");
    container.className = "attribute-container";

    let name = document.createElement("div");
    name.className = "attribute-name attribute-text";
    name.innerHTML = attributeDTO.name.split(".")[1];

    let element = document.createElement("span");
    element.innerHTML = attributeDTO.name.split(".")[0]+"|";
    element.className = "element-text";
    $(name).prepend(element);
    container.append(name);

    let linker = document.createElement("div");
    $(linker).addClass("attribute-linker");
    $(linker).append("<img src='images/link_white.png' class='link'>");
    $(linker).click(evt => {
        AttributeSearchSimilar(attributeDTO);
    });

    container.prepend(linker);

    $(container).click(evt => {
        $(container).toggleClass("selected");
        AttributeClicked($(container).hasClass("selected"), attributeDTO);
    });

    return container;
}

function CreateSelectAll(attributeDTOs) {
    let container = document.createElement("div");
    container.className = "selectall noselect";
    container.innerHTML = "Select All";

    $(container).click(evt => {
        selectedAttributes = attributeDTOs.slice();
        $("#attribute-panel > .attribute-container").addClass("selected");
        GetData(true);
    });

    return container;
}

function CreateDeSelectAll() {
    let container = document.createElement("div");
    container.className = "deselectall noselect";
    container.innerHTML = "Deselect All";

    $(container).click(evt => {
        selectedAttributes = [];
        DrawGraph([]);
        $("#attribute-panel > .attribute-container").removeClass("selected");
    });

    return container;
}

function AppendAttribute(attribute) {
    let attributePanel = $("#attribute-panel");
    attributePanel.append(CreateAttribute(attribute));
}

function AppendElement(element) {
    let elementPanel = $("#element-panel");
    elementPanel.append(CreateElement(element));
}

function AppendEventFrame(eventFrame) {
    let eventFramePanel = $("#eventframe-panel");
    eventFramePanel.append(CreateEventFrame(eventFrame));
}

function CreateStopwatchTimestamp(timeMs) {
    let time = new Date(timeMs);
    let history = $("#history");

    let historyBox = document.createElement("div");
    historyBox.className = "history-container history-value";
    let nameDiv = document.createElement("div");
    $(nameDiv).addClass("history-name");
    let addedName = false;
    let names = [];
    Object.keys(implementationHistory.currentImpl).map(impl => {
        if (implementationHistory.currentImpl[impl] !== implementationHistory.lastImpl[impl])
        {
            names.push(implementationHistory.currentImpl[impl]);
            implementationHistory.lastImpl[impl] = implementationHistory.currentImpl[impl];
            addedName = true;
        }
    });
    historyBox.append(time.getMinutes() + ":" + ("0" + time.getSeconds()).slice(-2) + "." + ("000" + time.getMilliseconds()).slice(-3));

    let percentDiff = 0;

    let mostRecentStamp = history.find(".history-value").first()[0];
    if (mostRecentStamp && mostRecentStamp.innerHTML) {
        let lastTime = mostRecentStamp.innerHTML.split(/[:.]/);
        let timeMillis = (time.getMinutes() * 60 + time.getSeconds()) * 1000 + time.getMilliseconds();
        let lastTimeMillis = (Number(lastTime[0]) * 60 + Number(lastTime[1])) * 1000 + Number(lastTime[2]);

        percentDiff = (timeMillis - lastTimeMillis) * 100 / lastTimeMillis;
    }

    if (percentDiff > 2.5) {
        $(historyBox).addClass("worse");
    }
    else if (percentDiff < -2.5) {
        $(historyBox).addClass("better");
    }

    if (addedName) {
        nameDiv.append(names.join(", "));
        let container = document.createElement("div");
        $(container).addClass("history-separator");
        if ($(history).children().length % 2 === 0) {
            $(container).addClass("b");
        }
        container.append(nameDiv);
        container.append(historyBox);
        history.prepend(container);
    }
    else {
        let container = history.children().first();
        let name = $(container).children().first();
        //container.prepend(historyBox);
        $(historyBox).insertAfter(name);
    }
    var historyValues = $(".history-value").length;
    $(".history-value").each(function (index, element) {
        let fade = (100 - (index - 1) / historyValues * 50)*.01;
        $(this).css("opacity", fade);
    });

    //$(history).animate({ scrollTop: $(history).prop("scrollHeight") }, "slow");

    localStorage["history"] = history.html();
}

function ClearChart() {
    chart.clear();
}

function ClearHistoryPanel() {
    $("#history").empty();
    Object.keys(implementationHistory.lastImpl).map(impl => {
        implementationHistory.lastImpl[impl] = undefined;
    });
}

function SelectRadioButtons(selected) {
    $.each($(selected).parent().find("label"), (i, x) => { $(x).children()[0].checked = selected.id === x.id; });
}

function showSearch() {
    $(".content").animate({ opacity: .5 }, 250);
    $("#header-left").animate({ opacity: .5 }, 250);
    $("#header-right").animate({ opacity: .5 }, 250);
}

function hideSearch() {
    $(".content").css("opacity", "1");
    $("#header-left").css("opacity", "1");
    $("#header-right").css("opacity", "1");
}

function AddImplementationOption(type, id, name, callback) {
    let div = document.createElement("div");
    $(div).append(name);
    div.className = "impl-picker noselect";

    $(div).click(event => {
        let selected = event.target;
        $("#" + type + "-implementation-picker").children().removeClass("selected");
        implementationHistory.lastImpl[type] = implementationHistory.currentImpl[type];
        implementationHistory.currentImpl[type] = name;
        localStorage[type + "-impl"] = name;
        $(selected).addClass("selected");

        let reenableUpdates = false;
        if (type === "data") {
            reenableUpdates = stopAutomaticUpdates();
        }

        callback(name);

        if (reenableUpdates) {
            startAutomaticUpdates(type === "data");
        }
        else if (type === "data") {
            if (selectedAttributes.length > 0) {
                GetData();
            }
        }
    });

    if (!localStorage[type + "-impl"] && $("#" + type + "-implementation-picker").children().length === 0) {
        $(div).addClass("selected");
        $(div).click();
    }
    
    if (localStorage[type + "-impl"] === name ) {
        $(div).addClass("selected");
        $(div).click();
    }

    $("#" + type + "-implementation-picker").append(div);
}