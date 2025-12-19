window.onload = function() {
    $(".datepicker").datepicker();

    var packageName = $("#package-name");
    var npmTrendForm = $("#npm-trend-form");
    var packageToTrack = $("#package-to-track");
    var startDate = $("#start-date");
    var endDate = $("#end-date");
    var errorDom = $("#error-text");
    var interval = $("input[name='interval']");
    var dataRange = $(".range-buttons .btn.active");
    var NPM_API_URL = "https://api.npmjs.org/downloads/range/";
    var NPM_DATE_FORMAT = "yy-mm-dd";
    var eyeIcon = $(".visible-options .btn .bi");
    var visibleOptions = $(".visible-options .btn");
    var rangeDataChanged = false;
    var annotationDate = null;
    var annotationDateInput = jQuery("#annotation-date")
    var annotationTitleInput = jQuery("#annotation-title")
    var annotationDescriptionInput = jQuery("#annotation-description")
    

    var intialSubtitleOption = [{
        text: "Add package to compare Download Stats",
        padding: 10,
        fontFamily: "'Lato', sans-serif",
        verticalAlign: "center",
        horizontalAlign: "center",
        fontSize: 20
    }];
    var chartTitleOption = {
        text: "NPM Download Stats",
        padding: 10,
        fontFamily: "'Lato', sans-serif"
    };

    var annotationSeries = {
        type: "scatter",
        markerType: "circle",
        markerSize: 0,
        color: "red",
        name: "Annotations",
        indexLabelFontFamily: "bootstrap-icons",
        indexLabelFontColor: "rgb(13, 110, 253)",
        showInLegend: false,
        highlightEnabled: false,
        dataPoints: []
    }
    
    var dataOptions = [];
    var chartOptions = {
        theme: "light2",
        animationEnabled: true,
        zoomEnabled: true,
        title: {
            text: "NPM Download Stats",
            padding: 10,
            fontFamily: "'Lato', sans-serif"
        },
        subtitles: [{
            text: "Add package to compare Download Stats",
            padding: 10,
            fontFamily: "'Lato', sans-serif"
        }],
        axisX: {
            crosshair: {
                enabled: true,
                snapToDataPoint: true
            }
        },
        legend: {
            cursor: "pointer",
            fontFamily: "'Lato', sans-serif",
            itemclick: function (e) {
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                } else {
                    e.dataSeries.visible = true;
                }
                visibleOptions.removeClass("active");
                eyeIcon.removeClass("bi-eye-slash");
                
                // hide annotation series if all other series are hidden
                annotationSeries.visible = e.chart.data.reduce((visible, data) => data.name != "Annotations" && (e.dataSeries.name == data.name ? e.dataSeries.visible : (data.visible || typeof data.visible === "undefined"))  ? true : visible, false);
                
                e.chart.render();
            }
        },
        toolTip: {
            shared: true,
            cornerRadius: 10,
            fontFamily: "'Lato', sans-serif",
            borderColor: "#f3f3f3",
            updated: function(e) {
                annotationDate = new Date(e.entries[0].xValue);
            },
            contentFormatter: function(e) {
                var content = " ", total = 0;
                var annotationEntries = e.entries.filter(entry => entry.dataSeries.name === "Annotations");
                e["entries"] = e.entries.filter(entry => {
                    return entry.dataSeries.name !== "Annotations"
                });
                
                annotationEntries.forEach(annotation => {
                    annotation.dataPoint.annotations.forEach(annotationData => {
                        content += "<div class='pb-2 mb-2' style='border-bottom: 1px solid #dedede;'><i class='bi bi-sticky me-2 text-primary'></i><span class='fw-bolder'>" + annotationData.title + "</span><p class='my-1 text-secondary'>" + annotationData.description + "<br/><span class='fst-italic'>" + CanvasJS.formatDate(annotationData.date, 'MMM DD, YYYY')+ "</span></p></div>";    
                    });
                });


                if(e.entries.length > 0) {
                    content += "<div class='mb-1 p-0 fw-bold'>" + CanvasJS.formatDate(e.entries[0].dataPoint.x, "MMM DD YYYY") + "</div>";
                    if(e.entries.length > 1)
                        for (var i = 0; i < e.entries.length; i++) {
                            if(e.entries[0].dataSeries.name != "Annotaions")
                                total += e.entries[i].dataPoint.y;
                        }
                    for (var i = 0; i < e.entries.length; i++) {
                        if(e.entries[0].dataSeries.name != "Annotaions") {
                            content += "<span style='color:" + e.entries[i].dataSeries.color + ";'>" + e.entries[i].dataSeries.name + "</span> " + e.entries[i].dataPoint.y + (e.entries.length > 1 && total != 0 ? (" (" + parseFloat((e.entries[i].dataPoint.y / total) * 100).toFixed(2) + "%)") : "");
                            content += "<br/>";
                        }
                        
                    }
                    content += e.entries.length > 1 ? ("<div class='mt-2 fw-bold'>Total: " + total + "</div>") : "";
                }

				return content;
            }
        },
        data: dataOptions
    }
    var chart;

    startDate.datepicker("setDate", "-1m");
    endDate.datepicker("setDate", "-1");

    npmTrendForm.on("submit", formSubmit);

    var packageList = localStorage.getItem("packageList");
    var annotationList = localStorage.getItem("annotationList");

    if(annotationList) {
        annotationList = JSON.parse(annotationList);
    } else {
        annotationList = {};
    }

    if(packageList) {
        packageList = JSON.parse(packageList);
        getAllPackageStats(true);
    } else {
        packageList = [];
        drawChart();
    } 
    
    function getAnnotationXValue(annotationDate) {
        annotationDate = new Date(annotationDate - new Date().getTimezoneOffset() * 60000);
        var annotationX = annotationDate;
        
        switch(interval.val()) {
            case "week":
                annotationX = Math.max(new Date(annotationDate.getTime() - annotationDate.getDay() * 24 * 60 * 60 * 1000), new Date(startDate.val()));
                break;
            case "month":
                annotationX = Math.max(new Date(annotationDate.getTime() - (annotationDate.getDate() - 1) * 24 * 60 * 60 * 1000), new Date(startDate.val()));
                break;
        }
        return annotationX;
    }

    async function getAllPackageStats(initial) {
        dataOptions.length = 0;
        drawChart();
        dataOptions.push(annotationSeries);
        await Promise.all(packageList.map(async (pkg) => {
            typeof initial === "boolean" & initial && packageToTrack.append(packageCard(pkg).dom())
            dataOptions.push({
                type: "spline",
                name: pkg,
                showInLegend: true,
                xValueFormatString: "DD MMM, YY DDD",
                dataPoints: []
            });
            await getPackageData(pkg);
        }));
        annotationSeries.dataPoints = [];
        drawChart();

        for (annotationDate in annotationList) {
            // var annotation = annotationList[annotationDate];
            annotationSeries.dataPoints.push({
                x: getAnnotationXValue(annotationDate),
                y: chart.axisY[0].get("viewportMinimum") + 10,
                annotations: annotationList[annotationDate].map(annotation => {
                    return {...annotation, date: new Date(annotation.date)}
                }),
                indexLabel: "\uf58c"
            });
        }

        setTimeout(() => chart.render(), 1500);
    }

    function formatDateforNPM(dateStr) {
        return $.datepicker.formatDate(NPM_DATE_FORMAT, new Date(dateStr));
    }

    function getDataRange() {
        if(rangeDataChanged) {
            startDate.datepicker("setDate", new Date(new Date(endDate.val()) - dataRange.data("range") * 30 * 24 * 60 * 60 * 1000))
            rangeDataChanged = false;
        }
    }

    async function getPackageData(packageName) {
        getDataRange();

        var currentStartDate = new Date(startDate.val());
        var finalDate = new Date(endDate.val());
        var npmResponse = null;
        var npmResponseData = null;

        function daysBetween(date1, date2) {
            const oneDay = 24 * 60 * 60 * 1000;
            return Math.round(Math.abs((date1 - date2) / oneDay));
        };

        const totalDays = daysBetween(currentStartDate, finalDate);
        
        if (totalDays <= 540) {
            npmResponse = await fetch( `${NPM_API_URL}${formatDateforNPM(new Date(startDate.val()))}:${formatDateforNPM(new Date(endDate.val()))}/${encodeURIComponent(packageName)}` );
            if(npmResponse.status != 200) 
                throw new Error(`Response from NPM is ${npmResponse.status}`);
            npmResponseData = await npmResponse.json();
        } else {

            // chunking the request as NPM API only allows max 540 days range
            while (currentStartDate <= finalDate) {
                
                let chunkEnd = new Date(currentStartDate);
                chunkEnd.setDate(chunkEnd.getDate() + 540);
                
                // Don't go beyond final end date
                if (chunkEnd > finalDate) {
                    chunkEnd = finalDate;
                }
                
                
                if (chunkEnd <= currentStartDate) break;
                
                let response = await fetch( `${NPM_API_URL}${formatDateforNPM(new Date(currentStartDate))}:${formatDateforNPM(chunkEnd)}/${encodeURIComponent(packageName)}` );
                    
                if (!response.ok) {
                    throw new Error(`Response from NPM is ${response.status}`);
                }
                
                const data = await response.json();
    
                if(npmResponseData == null) {
                    npmResponseData = data;
                } else {
                    if (data.downloads && data.downloads.length > 0) {
                        const uniqueDownloads = data.downloads.filter(download => 
                            !npmResponseData.downloads.some(existing => existing.day === download.day)
                        );
                        npmResponseData.downloads.push(...uniqueDownloads);
                    }
                }
                
                currentStartDate = new Date(chunkEnd);
                currentStartDate.setDate(currentStartDate.getDate() + 1);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        let data = dataOptions.filter(data => data.name === packageName);
        if(data.length == 0) {
            data[0] = dataOptions[dataOptions.push({
                type: "spline",
                name: packageName,
                showInLegend: true,
                xValueFormatString: "DD MMM, YY dd",
                dataPoints: []
            }) - 1];
        }

        switch(interval.val()) {
            case "week" : 
                data[0].dataPoints = npmResponseData.downloads.reduce((weeklyData, npmData) => {
                    if(weeklyData.length == 0 || new Date(npmData.day).getDay() == 0) {
                        var currentDate = new Date(npmData.day);
                        var nextWeekend = Math.min(currentDate.getTime() + ( 6 - currentDate.getDay()) * 24 * 60 * 60 * 1000, new Date(endDate.val()).getTime());
                        let toolTipContent = "";
                        
                        if(data[0].name == dataOptions[1].name) {
                            toolTipContent = "<div class='mb-1 p-0 fw-bold'>" + CanvasJS.formatDate(currentDate, "DD MMM") + " - " + CanvasJS.formatDate(nextWeekend, "DD MMM") + "</div> <span style='\"'color: {color};'\"'>{name}</span>: {y}";
                        } else {
                            toolTipContent = "<span style='\"'color: {color};'\"'>{name}</span>: {y}";
                        }
                        
                        weeklyData.push({x: currentDate, y: npmData.downloads, toolTipContent: toolTipContent == "" ? undefined : toolTipContent});
                        
                    } else {
                        weeklyData[weeklyData.length-1].y += npmData.downloads;
                    }
                    return weeklyData;
                }, []);
                break;
            case "month":
                data[0].dataPoints = npmResponseData.downloads.reduce((weeklyData, npmData) => {
                    if(weeklyData.length == 0 || new Date(npmData.day).getDate() == 1) {
                        var currentDate = new Date(npmData.day);
                        let toolTipContent = "";
                        if(data[0].name == dataOptions[1].name) {
                            toolTipContent = CanvasJS.formatDate(currentDate, "MMM, YY") + "<br/> <span style='\"'color: {color};'\"'>{name}</span>: {y}";
                        } else {
                            toolTipContent = "<span style='\"'color: {color};'\"'>{name}</span>: {y}";
                        }
                        
                        weeklyData.push({x: currentDate, y: npmData.downloads, toolTipContent: toolTipContent == "" ? undefined : toolTipContent});
                        
                    } else {
                        weeklyData[weeklyData.length-1].y += npmData.downloads;
                    }
                    return weeklyData;
                }, []);
                break;
            default:
                data[0].dataPoints = npmResponseData.downloads.map(data => ({ y: data.downloads, x: new Date(data.day)}))
        }
    }

    function showError(errorMessage) {
        errorDom.text(errorMessage);
        $('.collapse').collapse('show')
    }

    function hideError() {
        $('.collapse').collapse('hide')
    }

    async function formSubmit(e) {
        // prevent refreshing the page
        e.preventDefault();
        
        var packageElement =  packageCard(packageName.val())
        
        if(packageList.filter((pkgName) => packageName.val() === pkgName).length > 0) {
            showError("Package already exists");
            return;
        } 
        
        if(packageName.val() == "") {
            getAllPackageStats();
            return;
        }
        
        try {
            await getPackageData(packageName.val());
            drawChart();
            packageList.push(packageName.val());
            localStorage.setItem("packageList", JSON.stringify(packageList));
            packageToTrack.append(packageElement.dom());
            packageName.val("");
            hideError();
        } catch(e) {
            showError(e);
        }
    }

    function packageCard(name) {
        var packageName = name;
        return {
            dom: function() {
                var container = document.createElement("div");
                container.classList.add("border", "border-light", "shadow-sm", "mx-2", "p-2", "bg-white", "rounded", "flex-row", "flex")
                var icon = document.createElement("i");
                icon.classList.add("bi", "bi-x-lg", "ms-2", "cursor-pointer", "float-right");
                container.appendChild(document.createTextNode(packageName));
                container.setAttribute("data-package-name", packageName);
                container.appendChild(icon);
                return container;
            },
            getPackageName: function() {
                return packageName;
            }
        }
    }

    packageToTrack.on("click", "i.bi", function(e) {
        var packageCard = e.target.parentElement;
        
        packageList = packageList.filter((pkg) => pkg !== packageCard.getAttribute("data-package-name"));
        chartOptions.data = dataOptions = dataOptions.filter(data => data.name !== packageCard.getAttribute("data-package-name"));
        localStorage.setItem("packageList", JSON.stringify(packageList));
        packageCard.remove();
        drawChart();
    })

    function drawChart() {
        if(chart instanceof CanvasJS.Chart) {
            chart.destroy();
        }
        
        chart = new CanvasJS.Chart("chartContainer", chartOptions);

        if(chartOptions.data.length != 0 && chartOptions.subtitles != undefined) {
            chartOptions.subtitles = undefined;
            chartOptions.title = chartTitleOption;
        } else if(chartOptions.data.length == 0 && chartOptions.title != undefined) {
            chartOptions.title = undefined;
            chartOptions.subtitles = intialSubtitleOption;
            if(packageList.length != 0) {
                chartOptions.subtitles[0].text = "Loading Data. Please Wait..."
            } else {
                chartOptions.subtitles[0].text = "Add package to compare Download Stats"
            }
        }

        chart.render();
    }


    visibleOptions.on("click", function(e) {
        var hideSeries = false;
        jQuery(this).toggleClass("active");
        if(jQuery(this).hasClass("active")) {
            hideSeries = true;
            eyeIcon.addClass("bi-eye-slash");
        } else {
            eyeIcon.removeClass("bi-eye-slash");
        }
        
        chart.options.data.forEach(data => {
            data.visible = !hideSeries;
        })
        chart.render();
    });

    $("input[name='interval']").on("change", function(e) {
        interval = $(this);
        getAllPackageStats();
    })

    $(".range-buttons .btn").on("click", function(e) {
        rangeDataChanged = true;
        
        $(".range-buttons .btn").removeClass("active");
        dataRange = $(this);
        $(this).addClass("active");
        getAllPackageStats();
        
    })

    function resetRangeChangeButtons() {
        if( dataRange && (new Date(endDate.val()).getTime() - new Date(startDate.val()).getTime()) != (dataRange.data("range") * 30 * 24 * 60 * 60 * 1000)) {
            dataRange.removeClass("active");
            dataRange = null;
        }
    }

    startDate.on("change", function() {
        resetRangeChangeButtons();
        endDate.datepicker("option", "minDate", startDate.val());
        getAllPackageStats();
    });
    endDate.on("change", function() {
        startDate.datepicker("option", "maxDate", endDate.val());
        annotationDateInput.datepicker("option", "maxDate", endDate.val());
        getAllPackageStats();
    });

    endDate.datepicker("option", "minDate", startDate.val());
    startDate.datepicker("option", "maxDate", endDate.val());
    annotationDateInput.datepicker("option", "maxDate", endDate.val());
    // context menu code

    var contextMenu = document.getElementById("customContextMenu");
    var annotaionModal = new bootstrap.Modal(document.getElementById('annotation-modal'), {});
    
    
    var msPerDay = 24 * 60 * 60 * 1000;


    jQuery("#chartContainer").on('contextmenu', function(e) {
        var rect = e.target.getBoundingClientRect();
        var xAxisBounds = chart.axisX[0].get("bounds");
        var yAxisBounds = chart.axisY[0].get("bounds");
        
        // don't show up context menu if clicked outside plot area
        if(
           (
                (e.clientY - rect.top) < yAxisBounds.y1 ||
                (e.clientY - rect.top) > yAxisBounds.y2 ||
                (e.clientX - rect.left) < yAxisBounds.x2 ||
                (e.clientX - rect.left) > xAxisBounds.x2
           )
        ) {
            return;
        }

        
        e.preventDefault(); // Prevent default browser menu
        var menu = document.getElementById("customContextMenu");
        menu.style.top = e.clientY + "px";
        menu.style.left = e.clientX + "px";
        menu.style.display = "block";
        annotationDateInput.datepicker("setDate", annotationDate)
        chart.toolTip.hide();
    });

    // Hide menu on left click outside
    window.addEventListener('click', function(e) {
        if (e.target.closest("#chartContainer") === null) {
            document.getElementById("customContextMenu").style.display = "none";
        }
    });

    document.addEventListener("click", function() {
        contextMenu.style.display = "none";
    });

    // context menu actions
    jQuery("#add-annotations").on("click", function(e) {
        annotaionModal.show();
    })

    var annotationDPObject = null;
    
    jQuery("#annotation-form").on("submit", function(e) {
        e.preventDefault();
        var title = jQuery("#annotation-title").val();
        var description = jQuery("#annotation-description").val();
        var annotationDate = jQuery("#annotation-date").val();
        var annotationX = getAnnotationXValue(new Date(annotationDate));

        var annotationDps = annotationSeries.dataPoints.some(annotationDp => {
            if(annotationDp.x.getTime() == annotationX.getTime()) {
                annotationDp.annotations.push({
                    date: new Date(annotationDate),
                    title: title,
                    description: description, 
                })    
            }
        });

        if(!annotationDps) {
            annotationSeries.dataPoints.push({
                x: annotationX,
                y: chart.axisY[0].get("viewportMinimum") + 10,
                indexLabel: "\uf58c",
                annotations: [{
                    date: new Date(annotationDate),
                    title: title,
                    description: description
                }]
            });
        } 

        if(!annotationList.hasOwnProperty(new Date(annotationDate).getTime())) {
           annotationList[new Date(annotationDate).getTime()] = [];
        } 

        annotationList[new Date(annotationDate).getTime()].push({
            title: title,
            description: description,
            date: new Date(annotationDate).getTime()
        });

        localStorage.setItem("annotationList", JSON.stringify(annotationList));

        drawChart();
        
        // reset form fields
        annotaionModal.hide();
        annotationTitleInput.val("");
        annotationDescriptionInput.val("");
        annotationDateInput.val("");

        
    });
    
}