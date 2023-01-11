require(['esri/Map',
        'esri/views/MapView',
        'esri/layers/FeatureLayer',
        'esri/widgets/Legend',
        'esri/layers/MapImageLayer',
        'esri/widgets/Search',
        'esri/widgets/Home'],
    (Map, MapView, FeatureLayer, Legend, MapImageLayer, Search, Home) =>
        $(function () {

            $('#viewDiv').hide();
            $('#layerToggle').hide();
            $('#communityToggle').hide();
            $('#header').hide()
            $('#queryCIscore').hide()
            $('.enter_link').click(function (){
                $(this).parent('#splashscreen').fadeOut(500);
                $('#viewDiv').show();
                $('#layerToggle').show();
                $('#communityToggle').show();
                $('#header').show()
                $('#queryCIscore').show()
            });

            var $toggleLayerWidget = $('#layerListButton')
            $toggleLayerWidget.on('click', function (){
                $('#layerToggle').toggle()
                $('#communityToggle').toggle()
            });

            const map = new Map({
                basemap: 'gray-vector',
            });

            const view = new MapView({
                map: map,
                container: 'viewDiv',
                center: [-118.361820, 33.749796],
                zoom: 8
            });

            const searchWidget = new Search({view: view});
            view.ui.add(searchWidget, {
                position: 'top-left',
                index: 0
            });

            const homeButton = new Home({view: view});
            view.ui.add(homeButton, {position: 'top-left'});

            view.when(function() {
                var hideCommunity = view.map.layers.flatten(function(item){
                    return item.layers || item.sublayers;
                }).find(function (layer){
                    return layer.title === 'Community Boundaries';
                });
                hideCommunity.listMode = 'hide';

            });

            //let layerList = new LayerList({view: view});

            //console.log(layerList)
            //view.ui.add(layerList, {position: 'top-right'});

            let legend = new Legend({view: view});
            view.ui.add(legend, "bottom-left");

            var $toggleLegendWidget = $('#legendButton');
            $toggleLegendWidget.on('click', function (){
                if (legend.visible === true) {
                    legend.visible = false
                } else if (legend.visible === false) {
                    legend.visible = true
                } else {console.log('Cant Compute: Legend Widget Toggle')}
            });

            const dSymbol = {
                type: "simple-fill",
                outline: {
                    color: '#000000',
                    width: '0.5px'
                }
            };

            const defaultSymbol = {
                type: 'simple-fill'
            };

            const renderHealth = {
                type: 'simple',
                symbol: dSymbol,
                label: 'Health Score',
                defaultSymbol: defaultSymbol,
                defaultLabel: 'No Data',
                visualVariables: [
                    {
                        type: 'color',
                        field: 'HealthScore',
                        legendOptions: {
                            title: 'Health Score in LA County',
                        },
                        defaultSymbol: {
                            type: 'simple-fill',
                            color: 'grey',
                            style: 'solid',
                            outline: {
                                width: 0.1,
                                color: '#000000'
                            }
                        },
                        defaultLabel: 'No Data',
                        stops: [
                            {
                                value: 0,
                                color: '#1a37cb',
                                style: 'solid',
                                label: 'Health Score of 0'
                            },
                            {
                                value: 5,
                                color: '#bd0013',
                                style: 'solid',
                                label: 'Health Score of 5'
                            }
                        ]
                    }
                ]
            };

            const templateHealth = {
                title: "Tract {Tract_1}",
                content: [
                    {
                        type: "fields",
                        fieldInfos: [
                            {
                                fieldName: "HealthScore",
                                label: "Health Score"
                            },
                            {
                                fieldName: "CIscore",
                                label: "Cumulative Impact Score (out of 20)",
                                format: {
                                    digitSeparator: true,
                                    places: 0
                                }
                            }
                        ]
                    }
                ]
            };

            const healthLayer = new FeatureLayer({
                url: 'https://services.arcgis.com/RmCCgQtiZLDCtblq/arcgis/rest/services/EJSM_Scores/FeatureServer/0',
                renderer: renderHealth,
                title: 'Health Risk and Exposure',
                popupTemplate: templateHealth,
                visible: false
            });
            map.add(healthLayer)

            const high = {
                type: 'simple-fill',
                color: '#d90101',
                style: 'solid',
                outline: {
                    width: 0.5,
                    color: 'black'
                }
            };

            const mediumHigh = {
                type: 'simple-fill',
                color: '#b843e7',
                style: 'solid',
                outline: {
                    width: 0.5,
                    color: 'black'
                }
            };

            const mediumLow = {
                type: 'simple-fill',
                color: '#7702a4',
                style: 'solid',
                outline: {
                    width: 0.5,
                    color: 'black'
                }
            };

            const low = {
                type: 'simple-fill',
                color: '#0a4497',
                style: 'solid',
                outline: {
                    width: 0.5,
                    color: 'black'
                }
            };

            const classBreakInfo = [
                {
                    minValue: 0,
                    maxValue: 1.599,
                    symbol: low,
                    label: 'Score < 1.6'
                },
                {
                    minValue: 1.6,
                    maxValue: 2.99,
                    symbol: mediumLow,
                    label: 'Score < 3'
                },
                {
                    minValue: 3,
                    maxValue: 4.399,
                    symbol: mediumHigh,
                    label: 'Score < 4.4'
                },
                {
                    minValue: 4.4,
                    maxValue: 5,
                    symbol: high,
                    label: 'Score >= 4.5'
                }
            ];

            const renderSocial = {
                type: 'class-breaks',
                field: 'SVscore',
                legendOptions: {
                    title: 'Social and Health Vulnerability in LA County'
                },
                defaultSymbol: defaultSymbol,
                defaultLabel: 'No Data',
                classBreakInfos: classBreakInfo
            };

            const socialLayer = new FeatureLayer({
                url: 'https://services.arcgis.com/RmCCgQtiZLDCtblq/arcgis/rest/services/EJSM_Scores/FeatureServer/0',
                title: 'Social and Health Vulnerabiltiy',
                popupTemplate: {
                    title: 'Tract {Tract_1}',
                    content: [
                        {
                            type: 'fields',
                            fieldInfos: [
                                {
                                    fieldName: 'SVscore',
                                    label: 'Social and Health Vulnerability Score'
                                },
                                {
                                    fieldName: 'CIscore',
                                    label: 'Cumulative Impact Score (out of 20)'
                                }
                            ]
                        }
                    ]
                },
                visible: false,
                renderer: renderSocial,
                opacity: 0.9
            });
            map.add(socialLayer)

            const renderHaz = {
                type: 'class-breaks',
                field: 'HazScore',
                legendOptions: {
                    title: 'Hazards Score in LA County'
                },
                defaultSymbol: defaultSymbol,
                defaultLabel: 'No Data',
                classBreakInfos: classBreakInfo
            };

            const hazardLayer = new FeatureLayer({
                url: 'https://services.arcgis.com/RmCCgQtiZLDCtblq/arcgis/rest/services/EJSM_Scores/FeatureServer/0',
                title: 'Hazard Proximity and Sensitive Land Use',
                popupTemplate: {
                    title: 'Tract {Tract_1}',
                    content: [
                        {
                            type: "fields",
                            fieldInfos: [
                                {
                                    fieldName: "HazScore",
                                    label: "Hazard Score"
                                },
                                {
                                    fieldName: "CIscore",
                                    label: "Cumulative Impact Score (out of 20)",
                                    format: {
                                        digitSeparator: true,
                                        places: 2
                                    }
                                }
                            ]
                        }
                    ]
                },
                visible: false,
                renderer: renderHaz,
                opacity: 0.9
            });
            map.add(hazardLayer)

            const renderClimate = {
                type: 'unique-value',
                field: 'CCVscore',
                defaultSymbol: defaultSymbol,
                defaultLabel: 'No Data',
                uniqueValueInfos: [{
                    value: 1,
                    label: 'Score of 1',
                    symbol: {type: 'simple-fill', color: '#1a37cb'}
                }, {
                    value: 2,
                    label: 'Score of 2',
                    symbol: {type: 'simple-fill', color: '#6180d2'}
                }, {
                    value: 3,
                    label: 'Score of 3',
                    symbol: {type: 'simple-fill', color: '#ffffff'}
                }, {
                    value: 4,
                    label: 'Score of 4',
                    symbol: {type: 'simple-fill', color: '#ea8b96'}
                }, {
                    value: 5,
                    label: 'Score of 5',
                    symbol: {type: 'simple-fill', color: '#a80012'}
                }]
            };

            const templateClimate = {
                title: 'Tract {Tract_1}',
                content: [
                    {
                        type: 'fields',
                        fieldInfos: [
                            {
                                fieldName: 'CCVscore',
                                label: 'Climate Vulnerability Score'
                            },
                            {
                                fieldName: 'CIscore',
                                label: 'Cumulative Impact Score (out of 20)'
                            }
                        ]
                    }
                ]
            };

            const climateLayer = new FeatureLayer({
                url: 'https://services.arcgis.com/RmCCgQtiZLDCtblq/arcgis/rest/services/EJSM_Scores/FeatureServer/0',
                title: 'Climate Change Vulnerability',
                renderer: renderClimate,
                popupTemplate: templateClimate,
                visible: true
            });
            map.add(climateLayer)

            const boundaries = new MapImageLayer({
                url: 'https://public.gis.lacounty.gov/public/rest/services/LACounty_Dynamic/Political_Boundaries/MapServer',
                title: 'Community Boundaries',
                visible: false,
                sublayers: [{
                    id: 23,
                    title: 'Community Boundary Layer',
                    labelsVisible: true,
                    labelingInfo: [{
                        labelExpression: "[LABEL]",
                        labelPlacement: "always-horizontal",
                        symbol: {
                            type: 'text',
                            color: 'white',
                            haloColor: 'black',
                            haloSize: 1,
                            font: {
                                size: 12
                            }
                        },
                        minScale: 67500,
                        maxScale: 2300
                    }]
                }]
            });
            map.add(boundaries)

            const communityToggle = document.getElementById("communityLayer");
            communityToggle.addEventListener('change', function (){
                boundaries.visible = communityToggle.checked;
            });

            var $widgetSelect = $('input[type="checkbox"]').not('#communityLayer')
            console.log($widgetSelect)

            $('input[id="climateButton"]').prop('checked', true)
            $('input[id="hazardButton"]').prop('checked', false)
            $('input[id="socialButton"]').prop('checked', false)
            $('input[id="healthButton"]').prop('checked', false)

            $widgetSelect.on('click', function (){
                if ($(this).attr('class') === 'on'){

                    if($(this).attr('id') === 'climateButton'){
                        climateLayer.visible = false
                    } else if ($(this).attr('id') === 'hazardButton'){
                        hazardLayer.visible = false
                    } else if($(this).attr('id') === 'socialButton'){
                        socialLayer.visible = false
                    } else if($(this).attr('id') === 'healthButton'){
                        healthLayer.visible = false
                    } else {
                        console.log('Cant Compute: Turning off Layer')
                    }
                    $(this).attr('class', 'off');
                    //$(this).prop('checked', false);
                }

                else {
                    var $previousSelection = $('input[class="on"]');

                    if($previousSelection.attr('id') === 'climateButton'){
                        climateLayer.visible = false
                    } else if ($previousSelection.attr('id') === 'hazardButton'){
                        hazardLayer.visible = false
                    } else if($previousSelection.attr('id') === 'socialButton'){
                        socialLayer.visible = false
                    } else if($previousSelection.attr('id') === 'healthButton'){
                        healthLayer.visible = false
                    } else {
                        console.log('Cant Compute: Turning off Previous Layer')
                    }

                    $previousSelection.attr('class', 'off');
                    $previousSelection.prop('checked', false);

                    if($(this).attr('id') === 'climateButton'){
                        climateLayer.visible = true
                    } else if ($(this).attr('id') === 'hazardButton'){
                        hazardLayer.visible = true
                    } else if($(this).attr('id') === 'socialButton'){
                        socialLayer.visible = true
                    } else if($(this).attr('id') === 'healthButton'){
                        healthLayer.visible = true
                    } else {
                        console.log('Cant Compute: Turning on Layer')
                    }
                    $(this).attr('class', 'on');
                    //$(this).prop('checked', true);
                }
            });

            var $toggleQuery = $('#queryButton');
            $toggleQuery.on('click', function () {
                $('#queryCIscore').toggle()
            });

            function operatorAndNumber () {

                var opItems = [];
                var nuItems = [];

                var queryOptions = document.getElementById('queryOptions');
                var queryOptionsValue = queryOptions.value;
                opItems.push(queryOptionsValue);

                var numScore = document.getElementById('numScore');
                var numScoreValue = numScore.value;
                nuItems.push(numScoreValue);

                var inputValues = opItems.concat(nuItems)

                console.log(inputValues);

                if (queryOptionsValue == 'No Query Selected' || numScoreValue == '') {
                    alert('Invalid Query, please try again.')
                } else if (!( numScoreValue > 0 && numScoreValue <= 20)) {
                    alert('Please select a number from 1 to 20')
                } else {

                    console.log('Processing Query: CIscore ' + inputValues[0] + ' ' + inputValues[1])

                    var queryOperator;
                    if (queryOptionsValue == 'Greater Than (>)') {
                        queryOperator = '>'
                    } else if (queryOptionsValue == 'Less Than (<)') {
                        queryOperator = '<'
                    } else if (queryOptionsValue == 'Greater Than or Equal To (>=)') {
                        queryOperator = '>='
                    } else if (queryOptionsValue == 'Less Than or Equal To (<=)') {
                        queryOperator = '<='
                    } else if (queryOptionsValue == 'Equal to (=)') {
                        queryOperator = '='
                    } else {console.log('Cant Computer: Operator Extraction')}

                    var visibleLayer;
                    if (climateLayer.visible === true) {
                        visibleLayer = climateLayer
                    } else if (hazardLayer.visible === true) {
                        visibleLayer = hazardLayer
                    } else if (socialLayer.visible === true) {
                        visibleLayer = socialLayer
                    } else if (healthLayer.visible === true) {
                        visibleLayer = healthLayer
                    } else {console.log('Cant Compute: Establishing Definition')}

                    visibleLayer.definitionExpression = `CIscore ${queryOperator + numScoreValue}`;
                }

                return false;
            }

            var executeQuery = document.getElementById('executeQuery');
            executeQuery.onclick = operatorAndNumber;

            var clearQuery = document.getElementById('clearQuery');
            clearQuery.onclick = function () {
                $('#queryOptions').value = null;
                $('#numScore').value = null;
                climateLayer.definitionExpression = null
                hazardLayer.definitionExpression = null
                socialLayer.definitionExpression = null
                healthLayer.definitionExpression = null
                console.log('Query Cleared')
            }

        }));
