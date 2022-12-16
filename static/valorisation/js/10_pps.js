/**
 *  Creating map 
 */

var ppsMap = L.map("ppsMap", { center: [46.37730064858146, 2.1533203125000004], zoom: 6, zoomControl: false, preferCanvas: false, })

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

lightmatter.addTo(ppsMap);

layerControl.addTo(ppsMap);

/**
 *  Zoom control 
 */

zoomControl = L.control.zoom({
    zoomInTitle: 'Zoomer',
    zoomOutTitle: 'Dézoomer',
    position: 'bottomright'
});

zoomControl.addTo(ppsMap);

/**
 *  Legend control 
 */

var legendPps = L.control({ position: 'bottomleft' });

// Legend for pps map
legendPps.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 12, 30, 40, 45, 55];
    labels = [];
    div.innerHTML = '<b>Légende</b><br />Taux (%)<br /><br />'
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColorPps(grades[i] + 0.01) + '"></i> ' +
            grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '<br>' : ' &ndash; 100');
    }

    return div;
};
legendPps.addTo(ppsMap);


/**
 *  GeoJSON data
 */

ppsJson = L.geoJson(proprioData,
    { filter: function (feature, layer) { return !codesArm.includes(feature.properties.codgeo); }, style: stylePps, onEachFeature: onEachFeature, smoothFactor: 0 }).addTo(ppsMap);

/**
 *  Info control
 */

var infoPps = L.control();

infoPps.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};


// method used to update the control based on feature properties passed for pps map
infoPps.update = function (props) {
    this._div.innerHTML = (props ?
        '<b>' + props.libgeo + ' (' + props.codgeo + ')</b><br />' +
        '----<br />' +
        'Nombre de logements possédés uniquement par des propriétaires simples : ' + props.nblog_pp_s + '<br />' +
        'Taux de logements possédés uniquement par des propriétaires simples : ' + props.tx_logpp_s + ' %<br />' +
        '----<br />' +
        'Nombre de logements possédés uniquement par des propriétaires privés : ' + props.nblog_pp + '<br />' +
        'Nombre de logements total dans la commune : ' + props.nbtot + '<br />'
        : 'Survolez une commune pour plus d\'informations');
};

infoPps.addTo(ppsMap);


/**
 *  Styling
 */

/// pps Map color fill ///

// 6-class Blues from colorbrewer, from white to dark blue
// 6 classes chosen after Jenks breaks analysis

function getColorPps(d) {
    var palette = ['#eff3ff', '#c6dbef', '#9ecae1', '#6baed6', '#3182bd', '#08519c'];
    var jenksBreaks = [12, 30, 40, 45, 55]
    return d > jenksBreaks[4] ? palette[5] :
        d > jenksBreaks[3] ? palette[4] :
            d > jenksBreaks[2] ? palette[3] :
                d > jenksBreaks[1] ? palette[2] :
                    d > jenksBreaks[0] ? palette[1] :
                        palette[0];
};

// default style
function stylePps(feature) {
    return {
        opacity: 0,
        fillColor: getColorPps(feature.properties.tx_logpp_s),
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
    infoPps.update(layer.feature.properties);
}

// back to initial style when not hovered anymore
function resetHighlight(e) {
    ppsJson.resetStyle(e.target);
    infoPps.update();
}

// zoom to city when clicked
function zoomToFeature(e) {
    ppsMap.fitBounds(e.target.getBounds());
}

// adding these features to map
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}