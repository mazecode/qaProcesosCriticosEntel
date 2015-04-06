'use strict';/* Pending Request Service */qaProcesosCriticos.service('pendingRequestsService', [function () {    var $this = this;    var pending = [];    $this.add = function (request) {        pending.push(request);    };    $this.remove = function (request) {        pending = _.filter(pending, function (p) {            return p.url !== request;        });    };    $this.cancelAll = function () {        angular.forEach(pending, function (p) {            p.xhr.resolve();            p.deferred.reject();        });        pending.length = 0;    };}]);/* Http Service */qaProcesosCriticos.service('httpService', ['$http', '$q', 'pendingRequestsService', '$rootScope', function ($http, $q, pendingRequestsService, $rootScope) {    var $this = this;    $this.validateParams = function (obj) {        if (angular.isObject(obj)) {            for (var i in obj) if (obj.hasOwnProperty(i)) return true;        }        return false;    };    $this.param = function (obj) {        //if ($this.validateParams(obj)) {        return $.param(obj);        //}        //return {estado: false, message: 'Empty or invalid params'};    };    $this.error = function (response) {        if (response === null) {            $rootScope.errorStatus = 'No connection. Verify application is running.';        } else if (response.status === 0) {            $rootScope.errorStatus = 'No connection. Verify application is running.';        } else if (response.status == 401) {            $rootScope.errorStatus = 'Unauthorized';        } else if (response.status == 405) {            $rootScope.errorStatus = 'HTTP verb not supported [405]';        } else if (response.status == 500) {            $rootScope.errorStatus = 'Internal Server Error [500].';        } else {            $rootScope.errorStatus = JSON.parse(JSON.stringify(response.data));        }        return $q.reject(response);    }    $this.request = function (method, url, params) {        var deferred = $q.defer();        var params = $this.param(params);        var request = $http({            method: method,            url: url,            data: params        });        pendingRequestsService.add({            xhr: request,            url: url,            deferred: deferred        });        var promise = request            .success(function (response) {                //console.log(response)                deferred.resolve(response);            })            .error(function (response) {                var error = $this.error(response);                deferred.reject({estado: false, message: 'Something went wrong', error: error});            });        promise.abort = function () {            deferred.resolve();        };        promise.finally(function () {            //console.info('Cleaning up object references.');            promise.abort = angular.noop;            deferred = request = promise = null;        });        return deferred.promise;        //return promise;    }}]);/* Api Service */qaProcesosCriticos.service('apiFactory', ['httpService', function (httpService) {    var $this = this;    $this.restApi = 'http://192.168.1.100:9998/QAFacturacionWS/';    $this.urlWS;    $this.isEmpty = function (obj) {        for (var i in obj) if (obj.hasOwnProperty(i)) return false;        return true;    }    $this.url = function (url) {        $this.urlWS = $this.restApi + url;    }    $this.post = function (url, params) {        $this.url(url)        return httpService.request('POST', $this.urlWS, params);    }    $this.get = function (url, params) {        $this.url(url);        return httpService.request('GET', $this.urlWS, params);    }    $this.put = function (url, params) {        $this.url(url);        return httpService.request('PUT', $this.urlWS, params);    }    $this.delete = function (url, params) {        $this.url(url);        return httpService.request('DELETE', $this.urlWS, params);    }    $this.notify = function (title, message, type) {        var title = typeof title !== 'undefined' && title.length ? title : '';        var message = typeof message !== 'undefined' && message.length ? message : 'Error en el servidor, por favor espere.';        var type = typeof type !== 'undefined' && type.length ? type : 'notice';        if (message instanceof Array) {            angular.forEach(message, function (v, k) {                new PNotify({                    type: type,                    title: title,                    text: v,                    animate_speed: "fast",                    desktop: {                        desktop: true                    },                    sticker: false                });            });        } else {            new PNotify({                type: type,                title: title,                text: message,                animate_speed: "fast",                desktop: {                    desktop: true                },                sticker: false            });        }    }    $this.stackNotify = function (type, position) {        var stack_topleft = {"dir1": "down", "dir2": "right", "push": "top"};        var stack_bottomleft = {"dir1": "right", "dir2": "up", "push": "top"};        var stack_bar_top = {"dir1": "down", "dir2": "right", "push": "top", "spacing1": 0, "spacing2": 0};        var stack_bar_bottom = {"dir1": "up", "dir2": "right", "spacing1": 0, "spacing2": 0};        var opts = {            title: "Over Here",            text: "Check me out. I'm in a different stack.",            addclass: "stack_bottomleft",            cornerclass: "",            width: "60%"        };        switch (type) {            case 'error':                opts.title = "Oh No";                opts.text = "Watch out for that water tower!";                opts.type = "error";                break;            case 'info':                opts.title = "Atención!";                opts.text = "No se encontraron datos";                opts.type = "info";                break;            case 'success':                opts.title = "Good News Everyone";                opts.text = "I've invented a device that bites shiny metal asses.";                opts.type = "success";                break;        }        switch (position) {            case 'top':                opts.stack = stack_bar_top;                break;            case 'topleft':                opts.stack = stack_topleft;                break;            case 'bottom':                opts.stack = stack_bottomleft;                break;        }        new PNotify(opts);    }    $this.formatDates = function (today) {        var date = new Date(today);        var dd = parseInt(date.getDate());        var mm = parseInt(date.getMonth() + 1);        var yyyy = parseInt(date.getFullYear());        var result = yyyy;        if (mm < 10) {            result = result + '-0' + mm;        }        if (dd < 10) {            result = result + '-0' + dd;        }        return (result);    }    $this.getMonth = function (date) {        var month = date.getMonth();        return month < 10 ? '0' + month : month;        /* ('' + month) for string result */    }    $this.exportDataToTable = function (id, name) {        var blob = new Blob([document.getElementById(id).innerHTML], {            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"        });        saveAs(blob, name + ".xls");    }    $this.base64toBlob = function (base64Data, contentType) {        contentType = contentType || '';        var sliceSize = 1024;        var byteCharacters = atob(base64Data);        var bytesLength = byteCharacters.length;        var slicesCount = Math.ceil(bytesLength / sliceSize);        var byteArrays = new Array(slicesCount);        for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {            var begin = sliceIndex * sliceSize;            var end = Math.min(begin + sliceSize, bytesLength);            var bytes = new Array(end - begin);            for (var offset = begin, i = 0; offset < end; ++i, ++offset) {                bytes[i] = byteCharacters[offset].charCodeAt(0);            }            byteArrays[sliceIndex] = new Uint8Array(bytes);        }        return new Blob(byteArrays, {type: contentType});    }    $this.tableToExcel = function (table, name) {        var uri = 'data:application/vnd.ms-excel;filename=' + name + '.xls;base64,'            , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'            , base64 = function (s) {                return window.btoa(unescape(encodeURIComponent(s)))            }            , format = function (s, c) {                return s.replace(/{(\w+)}/g, function (m, p) {                    return c[p];                })            }        if (!table.nodeType) table = document.getElementById(table)        var ctx = {worksheet: name || 'worksheet', table: table.innerHTML}        // return window.location.href = uri +  base64(format(template, ctx));        var pom = document.createElement('a');        pom.setAttribute('href', uri + base64(format(template, ctx)));        pom.setAttribute('download', name + '.xls');        pom.click();    }    $this.splitString = function (string, separator, nb) {        var array = string.split(separator);        if (nb == null || nb == '' && nb != 0) {            return array;        }        return array[nb];    }    $this.utf8_encode = function (argString) {        if (argString === null || typeof argString === 'undefined') {            return '';        }        var string = (argString + '');        var utftext = '',            start, end, stringl = 0;        start = end = 0;        stringl = string.length;        for (var n = 0; n < stringl; n++) {            var c1 = string.charCodeAt(n);            var enc = null;            if (c1 < 128) {                end++;            } else if (c1 > 127 && c1 < 2048) {                enc = String.fromCharCode(                    (c1 >> 6) | 192, (c1 & 63) | 128                );            } else if ((c1 & 0xF800) != 0xD800) {                enc = String.fromCharCode(                    (c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128                );                // surrogate pairs            } else {                if ((c1 & 0xFC00) != 0xD800) {                    throw new RangeError('Unmatched trail surrogate at ' + n);                }                var c2 = string.charCodeAt(++n);                if ((c2 & 0xFC00) != 0xDC00) {                    throw new RangeError('Unmatched lead surrogate at ' + (n - 1));                }                c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;                enc = String.fromCharCode(                    (c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128                );            }            if (enc !== null) {                if (end > start) {                    utftext += string.slice(start, end);                }                utftext += enc;                start = end = n + 1;            }        }        if (end > start) {            utftext += string.slice(start, stringl);        }        return utftext;    }    $this.utf8_decode = function (str_data) {        var tmp_arr = [],            i = 0,            ac = 0,            c1 = 0,            c2 = 0,            c3 = 0,            c4 = 0;        str_data += '';        while (i < str_data.length) {            c1 = str_data.charCodeAt(i);            if (c1 <= 191) {                tmp_arr[ac++] = String.fromCharCode(c1);                i++;            } else if (c1 <= 223) {                c2 = str_data.charCodeAt(i + 1);                tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));                i += 2;            } else if (c1 <= 239) {                // http://en.wikipedia.org/wiki/UTF-8#Codepage_layout                c2 = str_data.charCodeAt(i + 1);                c3 = str_data.charCodeAt(i + 2);                tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));                i += 3;            } else {                c2 = str_data.charCodeAt(i + 1);                c3 = str_data.charCodeAt(i + 2);                c4 = str_data.charCodeAt(i + 3);                c1 = ((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63);                c1 -= 0x10000;                tmp_arr[ac++] = String.fromCharCode(0xD800 | ((c1 >> 10) & 0x3FF));                tmp_arr[ac++] = String.fromCharCode(0xDC00 | (c1 & 0x3FF));                i += 4;            }        }        return tmp_arr.join('');    }    $this.sort = function (array) {        array = array.sort(function (a, b) {            return a.item.localeCompare(b.item);        });    }    $this.flatten = function (arr) {        var output = [];        for (var key in arr) {            var tempObj = {};            tempObj = arr[key];            output.push(tempObj);        }        return output;    }    /* 123 || 321 */    $this.sortJSON = function (data, key, way) {        return data.sort(function (a, b) {            var x = a[key];            var y = b[key];            if (way === '123') {                return ((x < y) ? -1 : ((x > y) ? 1 : 0));            }            if (way === '321') {                return ((x > y) ? -1 : ((x < y) ? 1 : 0));            }        });    }    $this.unique = function (origArr) {        var newArr = [],            origLen = origArr.length,            found, x, y;        for (x = 0; x < origLen; x++) {            found = undefined;            for (y = 0; y < newArr.length; y++) {                if (origArr[x] === newArr[y]) {                    found = true;                    break;                }            }            if (!found) {                newArr.push(origArr[x]);            }        }        return newArr;    }    $this.isUndefinedOrNull = function (obj) {        return !angular.isDefined() || obj === null;    }    $this.isObjectAndNotNull = function (obj) {        return angular.isObject(obj) && obj != null && obj.length > 0;    }    $this.createDataForTable = function (data) {        var headers;        var body;        var out = {            estado: true,            message: 'OK',            data: {}        };        if (!apiFactory.isObjectAndNotNull(data)) {            out.message = 'Data is null or empty.';            out.estado = false;        }        angular.forEach(data, function (v, k) {            if (parseInt(v) == 0) {                if (k[0].hasOwnProperty('message') && k[0].message != '') {                    headers = apiFactory.splitString(k[0].message, '|');                } else {                    headers = [];                }            }        });    }}]);/* AmChart Service */qaProcesosCriticos.service('amChartService', ['rootFactory', function (rootFactory) {    var $this = this;    //$this.urlImages = rootFactory.root + '/js/amcharts/images/';    $this.urlImages = "http://www.amcharts.com/lib/3/images/";    $this.donut = function (chart, div, data, ejeX, ejey, title, labelTexto) {        labelTexto = typeof labelTexto !== 'undefined' || labelTexto != null ? labelTexto : '';        chart.titleField = title;        chart.valueField = ejeX;        chart.outlineColor = "#FFFFFF";        chart.outlineAlpha = 0.8;        chart.outlineThickness = 2;        chart.labelTexto = labelTexto;        chart.addClassNames = true;        chart.balloonTex = "[[title]]<br><span style='font-size:11px'><b>[[value]]</b> ([[percents]]%)</span>";        chart.pathToImages = $this.urlImages;        chart.categoryField = ejey;        chart.language = "es";        chart.numberFormatter = $this.formatNumber();        chart.labelRadius = 5;        chart.radius = "35%";        chart.innerRadius = "60%";        chart.dataDateFormat = "YYYY-MM-DD";        $this.animation(chart, true);        $this.legend(chart);        //chart.exportConfig = $this.export();        chart.dataProvider = data;        chart.write(div);    };    $this.column = function (chart, div, data, ejey) {        chart.pathToImages = $this.urlImages;        chart.categoryField = ejey;        chart.language = "es";        chart.numberFormatter = $this.formatNumber();        chart.dataDateFormat = "MMMM";        $this.categoryAxis(chart, false);        var valueAxis = new AmCharts.ValueAxis();        valueAxis.dashLength = 1;        valueAxis.axisColor = "#DADADA";        valueAxis.axisAlpha = 1;        /* valueAxis.unit = "$"; */        valueAxis.unitPosition = "left";        chart.addValueAxis(valueAxis);        var count = 0;        angular.forEach(data.graphs, function (v, k) {            var graph = new AmCharts.AmGraph();            //var color = '#' + Math.floor(Math.random() * 16777215).toString(16);            graph.title = v;            graph.balloonText = "<span style='font-size:13px;'>[[title]]: <b>[[value]]</b></span>";            graph.type = "column";            graph.valueField = v;            graph.fillAlphas = 0.9;            graph.lineAlpha = 0.2;            graph.useLineColorForBulletBorder = true;            if (count > 2) {                graph.hidden = true;            }            chart.addGraph(graph);            count++;        });        chart.dataProvider = data.data;        $this.animation(chart, false);        $this.legend(chart);        //var chartCursor = new AmCharts.ChartCursor();        //chart.addChartCursor(chartCursor);        chart.exportConfig = $this.export();        chart.write(div);    };    $this.dot = function (chart, div, data, ejey) {        chart.pathToImages = $this.urlImages;        chart.categoryField = ejey;        chart.language = "es";        chart.numberFormatter = $this.formatNumber();        chart.dataDateFormat = "YYYY-MM-DD";        $this.categoryAxis(chart, true);        var valueAxis = new AmCharts.ValueAxis();        valueAxis.dashLength = 1;        valueAxis.axisColor = "#DADADA";        valueAxis.axisAlpha = 1;        valueAxis.unitPosition = "left";        chart.addValueAxis(valueAxis);        $this.animation(chart, false);        $this.legend(chart);        var count = 0;        angular.forEach(data.graphs, function (v, k) {            var graph = new AmCharts.AmGraph();            var color = '#' + Math.floor(Math.random() * 16777215).toString(16);            graph.title = v;            graph.balloonText = "<span style='font-size:13px;'>[[title]] en [[category]]: <b>[[value]]</b></span>";            graph.type = "line";            graph.valueField = v;            graph.lineColor = color;            graph.lineThickness = 3;            graph.bullet = "round";            graph.bulletColor = color;            graph.bulletBorderColor = "#ffffff";            graph.bulletBorderAlpha = 1;            graph.bulletBorderThickness = 3;            graph.dashLengthLine = "dashLengthLine";            graph.bulletSize = 15;            if (count > 2) {                graph.hidden = true;            }            chart.addGraph(graph);            count++;        })        chart.dataProvider = data.data;        chart.exportConfig = $this.export();        var chartCursor = new AmCharts.ChartCursor();        chart.addChartCursor(chartCursor);        chart.write(div);    };    $this.animation = function (chart, bool) {        if (bool) {            chart.sequencedAnimation = true;            chart.startDuration = 1;            chart.startAlpha = 0;        } else {            chart.sequencedAnimation = false;            chart.startDuration = 0;            chart.startAlpha = 0;        }    };    $this.scrollBar = function (chart) {        var chartScrollbar = new AmCharts.ChartScrollbar();        chartScrollbar.updateOnReleaseOnly = true;        chartScrollbar.autoGridCount = true;        chartScrollbar.scrollbarHeight = 20;        chart.addChartScrollbar(chartScrollbar);    }    $this.export = function () {        var exportConfig = {            menuTop: "-10px",            menuBottom: "0px",            menuRight: "0px",            backgroundColor: "#efefef",            menuItems: [{                textAlign: 'center',                icon: $this.urlImages + 'export.png',                items: [{                    title: 'JPG',                    format: 'jpg'                }, {                    title: 'PNG',                    format: 'png'                }, {                    title: 'SVG',                    format: 'svg'                }, {                    title: 'PDF',                    format: 'pdf'                }]            }]        };        return exportConfig;    };    $this.legend = function (chart, legenddiv, text) {        legenddiv = typeof legenddiv !== 'undefined' && legenddiv.length != 0 ? legenddiv : false;        text = typeof text !== 'undefined' && text.length != 0 ? text : false;        var legend = new AmCharts.AmLegend();        legend.align = "center";        legend.markerType = "circle";        legend.valueText = "";        legend.useGraphSettings = false;        if (!text) {            legend.labelTexto = "[[title]]";        } else {            legend.labelTexto = text;        }        if (!legenddiv) {            chart.addLegend(legend);        } else {            chart.addLegend(legend, legenddiv);        }    };    $this.margin = function (chart) {        chart.autoMargins = false;        chart.marginRight = 10;        chart.marginLeft = 80;        chart.marginBottom = 20;        chart.marginTop = 20;    };    $this.formatNumber = function () {        return {            decimalSeparator: ",",            thousandsSeparator: ".",            precision: parseInt(-1)        };    };    $this.categoryAxis = function (chart, parse) {        parse = typeof parse !== 'undefined' && parse.length != 0 ? parse : true;        var categoryAxis = chart.categoryAxis;        categoryAxis.inside = false;        categoryAxis.axisAlpha = 0;        categoryAxis.gridAlpha = 0;        categoryAxis.tickLength = 0;        categoryAxis.minPeriod = "MM";        categoryAxis.equalSpacing = false;        categoryAxis.equalSpacing = true;        categoryAxis.boldPeriodBeginning = true;        if (parse) {            categoryAxis.parseDates = true;        }    };    $this.exportGraphToFormat = function (chart, format, fileName) {        var exp = new AmCharts.AmExport(chart);        exp.init();        exp.output({            format: format,            output: 'save',            backgroundColor: '#FFFFFF',            fileName: fileName,            dpi: 90        });    }}]);/* Chart Service */qaProcesosCriticos.service('chartService', ['apiFactory', 'amChartService', function (apiFactory, amChartService) {    var $this = this;    $this.processDataDetalle = function (data) {        var result = [], detalle = '', qCuentas = 0;        angular.forEach(data, function (v, k) {            result.push({                detalle: v.data.detalle,                qCuentas: v.data.qCuentas            });        });        //console.log('DETALLE', result);        var detallePieChart = new AmCharts.AmPieChart();        amChartService.donut(detallePieChart, 'detalle', result, 'qCuentas', 'detalle', 'detalle', null);        detallePieChart.dataProvider.shift();        detallePieChart.validateNow();    };    $this.processDataActual = function (data) {        console.log(data)        var temp = [], graphs = [], result = [], detalle = '', qCuentas = 0, id = '';        angular.forEach(data, function (v, k) {            if (v.data.hasOwnProperty('type')) {                id = v.data.type;            }            if (v.data.hasOwnProperty('detalle')) {                detalle = v.data.detalle;            }            if (v.data.hasOwnProperty('qCuentas')) {                qCuentas = v.data.qCuentas;            }            graphs.push(detalle);            if (temp.hasOwnProperty(id)) {                temp[id][detalle] = qCuentas;            } else {                temp[id] = {'fecha': 'Marzo'};                temp[id][detalle] = qCuentas;            }        });        result['data'] = apiFactory.flatten(temp);        result['graphs'] = apiFactory.unique(graphs);        console.log('ACTUAL', result);        var actualSerialChart = new AmCharts.AmSerialChart();        amChartService.column(actualSerialChart, 'actual', result, 'fecha', 'qCuentas', 'Actual');        actualSerialChart.dataProvider.shift();        actualSerialChart.validateNow();    };    $this.processDataHistorico = function (data) {        var temp = [], graphs = [], result = [], detalle = '', qCuentas = 0, id = '', fecha;        angular.forEach(data, function (v, k) {            if (v.data.hasOwnProperty('mes') && v.data.hasOwnProperty('ano')) {                id = v.data.ano + '' + v.data.mes;                fecha = apiFactory.formatDates(v.data.ano + '-' + v.data.mes + '-01');            }            if (v.data.hasOwnProperty('detalle')) {                detalle = v.data.detalle;            }            if (v.data.hasOwnProperty('qCuentas')) {                qCuentas = v.data.qCuentas;            }            graphs.push(detalle);            if (temp.hasOwnProperty(id)) {                temp[id][detalle] = qCuentas;            } else {                temp[id] = {'fecha': fecha};                temp[id][detalle] = qCuentas;            }        });        result['data'] = apiFactory.flatten(temp);        result['graphs'] = apiFactory.unique(graphs);        //console.log('HISTORICO', result);        var historicoSerialChart = new AmCharts.AmSerialChart();        amChartService.dot(historicoSerialChart, 'historico', result, 'fecha', null);        historicoSerialChart.dataProvider.shift();        historicoSerialChart.validateNow();    };}]);/* Storage Service */qaProcesosCriticos.factory('storageService', ['localStorageService', function (localStorageService) {    var storage = {        create: function (key, val) {            return localStorageService.set(key, val);        },        getItem: function (key) {            return localStorageService.get(key);        },        removeItem: function (key) {            return localStorageService.remove(key);        },        clearNumbers: function () {            return localStorageService.clearAll(/^\d+$/);        },        clearAll: function () {            return localStorageService.clearAll();        },        getLength: function () {            return localStorageService.length();        },        getKeys: function () {            return localStorageService.keys();        },        isSupported: function () {            if (localStorageService.isSupported) {                return true;            }            return false;        }    };    return storage;}]);