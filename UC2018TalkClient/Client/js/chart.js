// Enclose implementation in IIFE to prevent globals
var chart = (function () {
    "use strict";

    // Colors to use for plotting
    var traceColors = [
        '#022e3a',
        '#87989a',
        '#b0c7a6',
        '#a1855b',
        '#996881',
        '#0f7e9b'
    ];

    // Colors to use for EF zones
    var eventColors = [
        '#022e3a',
        '#87989a',
        '#b0c7a6',
        '#a1855b',
        '#996881',
        '#0f7e9b'
    ];

    var rawData = [];

    function removeTrace(attributeDTO) {
        for (var i = rawData.length - 1; i >= 0; i--) {
            if (rawData[i].Name === attributeDTO.name) {
                rawData.splice(i, 1);
            }
        }

        this.plotData(rawData, events);
    }

    function plotData(traceData, eventData) {
        rawData = traceData;
        // Clean trace data and gather summary info
        var traces = cleanData(traceData);
        var mergedTraces = [].concat.apply([], traces);

        var minTime, maxTime;
        for (var i = 0; i < mergedTraces.length; i++) {
            var traceTime = mergedTraces[i].time;
            minTime = (!minTime || minTime > traceTime) ? traceTime : minTime;
            maxTime = (!maxTime || maxTime < traceTime) ? traceTime : maxTime;
        }

        // Clean event data
        var events = cleanEvents(eventData, minTime, maxTime);

        // Setup plot area
        let chartElement = $("svg");
        chartElement.empty();

        var svg = d3.select('svg');
        var margin = { top: 20, right: 20, bottom: 30, left: 50 };

        let elementWidth = chartElement.width();
        let elementHeight = chartElement.height();

        var width = elementWidth - margin.left - margin.right;
        var height = elementHeight - margin.top - margin.bottom;
        var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Plot helpers
        var x = d3.scaleTime()
            .rangeRound([0, width]);

        var y = d3.scaleLinear()
            .rangeRound([height, 0]);

        var line = d3.line()
            .x(function (d) { return x(d.time); })
            .y(function (d) { return y(d.value); });

        // Set axis scales
        x.domain(d3.extent(mergedTraces, function (d) { return d.time; }));
        y.domain(d3.extent(mergedTraces, function (d) { return d.value; }));

        // Draw X axis
        g.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x));

        // Draw Y axis
        g.append('g')
            .call(d3.axisLeft(y));
        
        // Draw each EF zone
        events.forEach(function (event, index) {
            var startX = x(event[0].start);
            var endX = x(event[0].end);

            g.append('rect')
                .attr('fill', eventColors[index % eventColors.length])
                .attr('fill-opacity', 0.2)
                .attr('stroke', eventColors[index % eventColors.length])
                .attr('stroke-width', 0.5)
                .attr('x', startX)
                .attr('y', 0)
                .attr('height', height)
                .attr('width', endX - startX);
        });

        let colorMultiplier = 0.1;

        // Draw each trace line
        traces.forEach(function (trace, index) {
            g.append('path')
                .datum(trace)
                .attr('fill', 'none')
                .attr('stroke', d3.hsl(traceColors[index % traceColors.length]).brighter(Math.floor(index / traceColors.length) * colorMultiplier))
                .attr('stroke-linejoin', 'round')
                .attr('stroke-linecap', 'round')
                .attr('stroke-width', 1.5)
                .attr('d', line);
        });

        if (traceData.length > 0) {
            // add legend   
            var legend = svg.append("g")
                .attr("class", "legend")
                .attr('transform', 'translate(-20,50)');

            // legend background
            legend.append("rect")
                .attr("class", "legend-bg")
                .attr("x", width - 150)
                .attr("y", -10)
                .attr("width", 220)
                .attr("height", Math.max(100, traceData.length * 20 + 10))
                .attr("stroke", "black")
                .attr("fill", "white");

            // legend dots
            legend.selectAll('rect:not(.legend-bg)')
                .data(traceData)
                .enter()
                .append("rect")
                .attr("x", width - 140)
                .attr("y", function (d, i) { return i * 20; })
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", function (d) {
                    let index = traceData.indexOf(d);
                    let color = d3.hsl(traceColors[index % traceColors.length]);
                    let newColor = color.brighter(Math.floor(index / traceColors.length) * colorMultiplier);
                    return newColor;
                    //return traceColors[traceData.indexOf(d)];
                });

            // legend text
            legend.selectAll('text')
                .data(traceData)
                .enter()
                .append("text")
                .attr("x", width - 127)
                .attr("y", function (d, i) { return i * 20 + 10; })
                .text(function (d) { return d.Name; });
        }
    }

    function redraw() {
        let eventsToUse = events;
        if (!$("#eventframes-checkbox").hasClass("selected")) {
            eventsToUse = [];
        }

        plotData(rawData, eventsToUse);
    }

    function updateData(traceData) {
        traceData.forEach(function (dat) {
            rawData.forEach(function (trend) {
                if (trend.Name === dat.Name) {
                    trend.Items = trend.Items.concat(dat.Items);
                }
            });
        });



        let eventsToUse = events;
        if (!$("#eventframes-checkbox").hasClass("selected")) {
            eventsToUse = [];
        }

        plotData(rawData, eventsToUse);
    }

    function cleanData(data) {
        if (!data || data.length === 0) {
            return [];
        }

        var result = [];
        data.forEach(function (traceData) {
            result.push(traceData['Items']
                // Filter out bad data
                .filter(function (item) {
                    return !!item['Good'];
                })
                // Map to Date object and value
                .map(function (item) {
                    return {
                        time: new Date(item['Timestamp']),
                        value: item['Value']
                    };
                })
            );
        });

        return result;
    }

    function cleanEvents(events, minTime, maxTime) {
        if (!events || events.length === 0) {
            return [];
        }

        var result = [];
        events.forEach(function (eventData) {
            if (new Date(eventData.endTime) > minTime) {
                let range = [{ startTime: eventData.startTime, endTime: eventData.endTime }];
                result.push(range
                    // Map to Date objects, clamped to fit in trend time range
                    .map(function (event) {
                        var startTime = event['startTime'] ? new Date(event['startTime']) : undefined;
                        var endTime = event['endTime'] ? new Date(event['endTime']) : undefined;

                        return {
                            start: (startTime && startTime >= minTime) ? startTime : minTime,
                            end: (endTime && endTime <= maxTime) ? endTime : maxTime
                        };
                    })
                );
            }
        });

        return result;
    }

    // Return callable methods from IIFE
    return {
        redraw: redraw,
        plotData: plotData,
        updateData: updateData,
        removeTrace: removeTrace
    };
})();