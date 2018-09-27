"use strict";

async function EventFrameSearch(elementDTO, isTimed = true) {
    let config = new Config();

    //Timed
    if (isTimed) {
        timer.startOrContinue();
    }

    let response = await currentEventFrameImplementation.EventFrameSearch(config, elementDTO);

    //End Timed
    if (isTimed) {
        timer.pause(stopwatch_eventFrameSearch_key);
    }
    let results = response.Items.map(evtfr => new EventFrameDTO(evtfr));

    let eventFramePanel = $("#eventframe-panel");
    eventFramePanel.empty();

    events = [];
    results.map(function (evtfr) { events.push(evtfr); });

    results.map(x => AppendEventFrame(x));

}

async function AttributeClicked(added, attributeDTO) {
    if (added) {
        selectedAttributes.push(attributeDTO);
    }
    else {
        let index = selectedAttributes.findIndex(function (attribute) {
            let eq = attribute.webId === attributeDTO.webId;
            return eq;
        });
        selectedAttributes.splice(index, 1);
    }

    GetData(added, attributeDTO);
}

async function GetData(added, attributeDTO) {
    let response = '';
    let config = new Config();

    if (added === undefined && attributeDTO === undefined) {
        timer.startOrContinue();
        response = await currentDataImplementation.DataQuery(config, selectedAttributes);
        timer.pause(stopwatch_dataQuery_key);
    }
    else if (added) {
        timer.startOrContinue();
        response = await currentDataImplementation.HandleAttributeAddition(
            config,
            attributeDTO,
            selectedAttributes);
        timer.pause(stopwatch_dataQuery_key);
    }
    else {
        timer.startOrContinue();
        response = await currentDataImplementation.HandleAttributeRemoval(
            config,
            attributeDTO,
            selectedAttributes);
        timer.pause(stopwatch_dataQuery_key);
    }

    if (!updatesRunning) {
        if (openedThread !== -1) {
            console.log("Automatic updates aren't enabled; cancel the update thread.");
            clearInterval(openedThread);
        }
        Object.values(openWebsockets).map(socket => {
            console.log("Automatic updates aren't enabled; close all websockets.");
            socket.close();
        });
        openWebsockets = [];
    }

    let timeElapsed = timer.sum();
    CreateStopwatchTimestamp(new Date(timeElapsed));

    DrawGraph(TransformData(currentDataImplementation.resultType, response));
}

async function AttributeSearch(elementDTO) {
    let inputField = $('#attribute-search');
    let inputValue = inputField.val();

    if (!inputValue) {
        inputValue = "*";
    }

    if (!elementDTO || Object.keys(elementDTO).length === 0) {
        elementDTO = { name: "*" };
    }

    let config = new Config();

    //Timed
    timer.startOrContinue();
    let response = await currentAttributeImplementation.AttributeSearch(config, elementDTO, inputValue);
    timer.pause(stopwatch_attributeSearch_key);
    //End Timed
    let results = response.Items.map(attr => new AttributeDTO(attr));

    let attributePanel = $("#attribute-panel");
    attributePanel.empty();

    selectedAttributes = [];
    attributePanel.append(CreateSelectAll(results));
    attributePanel.append(CreateDeSelectAll());
    results.map(x => AppendAttribute(x));
}

async function AttributeSearchSimilar(attributeDTO) {
    DeselectElement(selectedElement);
    selectedElement = {};

    let searcher = new SimilarAttributeSearch();
    let config = new Config();
    let response = await searcher.AttributeSearch(config, attributeDTO);

    let attributePanel = $("#attribute-panel");
    attributePanel.empty();
    selectedAttributes = [];

    let results = response.GetTemplateImplementors.Content.Items.map(x => new AttributeDTO(x));
    attributePanel.append(CreateSelectAll(results));
    attributePanel.append(CreateDeSelectAll());

    results.map(x => AppendAttribute(x));
}

async function ElementSearch() {
    let input = $('#element-search');

    let searchQuery = input.val();
    
    if (searchQuery === "") {
        searchQuery = "*";
    }

    let config = new Config();

    //Timed
    timer.startOrContinue();
    let response = await currentElementImplementation.ElementSearch(config, searchQuery);
    timer.pause(stopwatch_elementSearch_key);
    //End Timed
    let results = response.Items.map(element => new ElementDTO(element));
    results.sort((a, b) => {
        let indexOfIntA = a.name.search(/\d/);
        let indexOfIntB = b.name.search(/\d/);

        if (indexOfIntA < 0 || indexOfIntB < 0) {
            return a.name > b.name;
        }

        let aAsNumber = Number(a.name.substring(indexOfIntA));
        let bAsNumber = Number(b.name.substring(indexOfIntB));

        if (isNaN(aAsNumber) || isNaN(bAsNumber)) {
            return a.name > b.name;
        }

        return aAsNumber - bAsNumber;
    });

    let elementPanel = $("#element-panel");
    elementPanel.empty();
    selectedElement = {};
    selectedAttributes = [];

    results.map(x => AppendElement(x));
}

function DrawGraph(data) {
    let eventsToUse = events;
    if (!$("#eventframes-checkbox").hasClass("selected")) {
        eventsToUse = [];
    }

    chart.plotData(data, eventsToUse);
}

function AppendGraph(response) {
    if ($("#refresh-checkbox").hasClass("selected")) {
        chart.updateData(TransformData(currentDataImplementation.resultType, response));
    }
}

function TransformData(format, data) {
    if (Array.isArray(data) && data.length === 0) {
        return selectedAttributes.map(attribute => new ChartDataDTO({ Name: attribute.name, Items: data }));
    }

    let transform = [];

    switch (format) {
        case "Multiple Calls":
            data.map(function (response, i) {
                transform.push(new ChartDataDTO({
                    Name: selectedAttributes[i].name, Items: response.Items
                }));
            });
            break;
        case "Batch":
            for (let i = 0; i < Object.values(data).length; i++) {
                transform.push(new ChartDataDTO({
                    Name: selectedAttributes[i].name, Items: data[i].Content.Items
                }));
            }
            break;
        case "Stream Update":
            data.Items.map(function (update) {
                let attribute = update.SourcePath.substring(update.SourcePath.lastIndexOf("\\") + 1).replace("|", ".");
                transform.push(new ChartDataDTO({
                    Name: attribute, Items: update.Events
                }));
            });
            break;
        case "Channel":
            let index = selectedAttributes.findIndex(function (attr) {
                return attr.webId === data.Items[0].WebId;
            });
            transform.push(new ChartDataDTO({
                Name: selectedAttributes[index].name, Items: data.Items[0].Items
            }));
            break;
        case "Single Call":
            data.Items.map(function (item, i) {
                transform.push(new ChartDataDTO({
                    Name: selectedAttributes[i].name, Items: item.Items
                }));
            });
            break;
        default:
            console.log("Something went wrong with the data format");
            break;
    }

    return transform;
}

async function Get(url, useCache) {
    let requestParameters = {
        type: 'GET',
        url: url,
        headers: { "cache-control": "max-age=0" }
    };

    if (useCache) {
        requestParameters["cache"] = true;
        requestParameters["headers"] = {
            "cache-control": "no-cache",
            "Access-Control-Allow-Origin": "*"
        };
    }
    return await $.ajax(requestParameters);
}

async function Post(url, content) {
    return await $.ajax({
        type: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        url: url,
        data: JSON.stringify(content)
    });
}

var timer = new Stopwatch();

var selectedAttributes = [];
var selectedElement = {};

var useBasic = false;
var usr = "";
var pwd = "";