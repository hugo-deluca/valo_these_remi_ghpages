/**
 *  Creating map 
 */

var valueMap = L.map("valueMap", { center: [46.37730064858146, 2.1533203125000004], zoom: 6, zoomControl: false, preferCanvas: false, })

/**
 *  Layer control 
 */

// Dark tiles
var darkmatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 18
});


// Light tiles
var lightmatter = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 18
});


// OpenStreetMap tiles
var osm = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', { "attribution": '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', "detectRetina": false, "maxNativeZoom": 18, "maxZoom": 18, "minZoom": 0, "noWrap": false, "opacity": 1, "subdomains": "abc", "tms": false });

// Defining base layers and overlays for layer control
var baseLayers = {
    "Light Matter": lightmatter,
    "Dark Matter": darkmatter,
    "OpenStreetMap": osm,
};

var overlays = {
};

var layerControl = L.control.layers(baseLayers, overlays, { position: 'bottomright' });


lightmatter.addTo(valueMap);

layerControl.addTo(valueMap);

/**
 *  Zoom control 
 */
zoomControl = L.control.zoom({
    zoomInTitle: 'Zoomer',
    zoomOutTitle: 'Dézoomer',
    position: 'bottomright'
});

zoomControl.addTo(valueMap);

/**
 *  Legend control 
 */

var legendValue = L.control({ position: 'bottomleft' });

// Legend
legendValue.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1200, 1600, 2150, 3000, 4750];
    labels = [];
    var nullColor = '#b9b9b9'
    div.innerHTML = '<b>Légende</b><br />Estimation (€/m²)<br /><br />'
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColorValue(grades[i] + 0.01) + '"></i> ' +
            numberWithSeparators(grades[i]) + (numberWithSeparators(grades[i + 1]) ? ' &ndash; ' + numberWithSeparators(grades[i + 1]) + '<br>' : ' et +');
    }
    div.innerHTML += '<br /><i style="background:' + nullColor + '"></i> Pas d\'information'

    return div;
};
legendValue.addTo(valueMap);


/**
 *  GeoJSON data
 */

var valueJson = L.geoJson(proprioData, { filter: function (feature, layer) { return !codesArm.includes(feature.properties.codgeo); }, style: styleValue, onEachFeature: onEachFeature, smoothFactor: 0 }).addTo(valueMap);

/**
 *  Info control
 */

var infoValue = L.control();

infoValue.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};


// method used to update the control based on feature properties
infoValue.update = function (props) {
    this._div.innerHTML = (props ?
        '<b>' + props.libgeo + ' (' + props.codgeo + ')</b><br />' +
        '----<br />' +
        'Estimation du prix moyen : ' + Math.round(props.avg_pm2_20 * 100) / 100 + ' €/m²<br />'
        : 'Survolez une commune pour plus d\'informations');
};

infoValue.addTo(valueMap);


/**
 *  Styling
 */


// 6-class Oranges from colorbrewer, from light to dark orange
// 6 classes chosen after Jenks breaks analysis and rounding

function getColorValue(d) {
    var palette = ['#feedde', '#fdd0a2', '#fdae6b', '#fd8d3c', '#e6550d', '#a63603'];
    var nullColor = '#b9b9b9';
    var jenksBreaks = [1200, 1600, 2150, 3000, 4750];
    if (d == null) { return nullColor };
    return d > jenksBreaks[4] ? palette[5] :
        d > jenksBreaks[3] ? palette[4] :
            d > jenksBreaks[2] ? palette[3] :
                d > jenksBreaks[1] ? palette[2] :
                    d > jenksBreaks[0] ? palette[1] :
                        palette[0];
};

// default style
function styleValue(feature) {
    return {
        color: '#ededed',
        opacity: 0, // border opacity
        weight: 0.1,
        fillColor: getColorValue(feature.properties.avg_pm2_20),
        fillOpacity: 0.9
    };
};


// Highlight city when hovered
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
    infoValue.update(layer.feature.properties);
}

// back to initial style when not hovered anymore
function resetHighlight(e) {
    valueJson.resetStyle(e.target);
    infoValue.update();
}

// zoom to city when clicked
function zoomToFeature(e) {
    valueMap.fitBounds(e.target.getBounds());
}

// adding these features to map
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}