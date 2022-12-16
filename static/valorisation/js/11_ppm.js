/**
 *  Creating map 
 */

var ppmMap = L.map("ppmMap", { center: [46.37730064858146, 2.1533203125000004], zoom: 6, zoomControl: false, preferCanvas: false, })

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

lightmatter.addTo(ppmMap);

layerControl.addTo(ppmMap);

/**
 *  Zoom control 
 */
zoomControl = L.control.zoom({
    zoomInTitle: 'Zoomer',
    zoomOutTitle: 'Dézoomer',
    position: 'bottomright'
});
zoomControl.addTo(ppmMap);

/**
 *  Legend control 
 */

var legendPpm = L.control({ position: 'bottomleft' });

// Legend for ppm map
legendPpm.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 15, 35, 45, 60];
    labels = [];
    div.innerHTML = '<b>Légende</b><br />Taux (%)<br /><br />'
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColorPpm(grades[i] + 0.01) + '"></i> ' +
            grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '<br>' : ' &ndash; 100');
    }

    return div;
};
legendPpm.addTo(ppmMap);


/**
 *  GeoJSON data
 */

ppmJson = L.geoJson(proprioData, { filter: function (feature, layer) { return !codesArm.includes(feature.properties.codgeo); }, style: stylePpm, onEachFeature: onEachFeature, smoothFactor: 0 }).addTo(ppmMap);

/**
 *  Info control
 */

var infoPpm = L.control();

infoPpm.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};


// method used to update the control based on feature properties passed for ppm map
infoPpm.update = function (props) {
    this._div.innerHTML = (props ?
        '<b>' + props.libgeo + ' (' + props.codgeo + ')</b><br />' +
        '----<br />' +
        'Nombre de logements possédés uniquement par des multipropriétaires : ' + props.nblog_pp_m + '<br />' +
        'Taux de logements possédés uniquement par des multipropriétaires : ' + props.tx_logpp_m + ' %<br />' +
        '----<br />' +
        'Nombre de logements possédés uniquement par des propriétaires privés : ' + props.nblog_pp + '<br />' +
        'Nombre de logements total dans la commune : ' + props.nbtot + '<br />'
        : 'Survolez une commune pour plus d\'informations');
};

infoPpm.addTo(ppmMap);


/**
 *  Styling
 */

/// ppm Map color fill ///

// 6-class Greens from colorbrewer, from white to dark green
// 6 classes chosen after Jenks breaks analysis

function getColorPpm(d) {
    var palette = ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'];
    var jenksBreaks = [15, 35, 45, 60]
    return d > jenksBreaks[3] ? palette[4] :
        d > jenksBreaks[2] ? palette[3] :
            d > jenksBreaks[1] ? palette[2] :
                d > jenksBreaks[0] ? palette[1] :
                    palette[0];
};

// default style
function stylePpm(feature) {
    return {
        opacity: 0,
        fillColor: getColorPpm(feature.properties.tx_logpp_m),
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
    infoPpm.update(layer.feature.properties);
}

// back to initial style when not hovered anymore
function resetHighlight(e) {
    ppmJson.resetStyle(e.target);
    infoPpm.update();
}

// zoom to city when clicked
function zoomToFeature(e) {
    ppmMap.fitBounds(e.target.getBounds());
}

// adding these features to map
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}