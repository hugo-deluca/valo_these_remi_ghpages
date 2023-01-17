/**
 *  Creating map 
 */

var ftoTransfertsComm = L.map("ftoTransfertsComm", { center: [46.37730064858146, 2.1533203125000004], zoom: 6, zoomControl: false, preferCanvas: false, })

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

lightmatter.addTo(ftoTransfertsComm);

layerControl.addTo(ftoTransfertsComm);

/**
 *  Zoom control 
 */
zoomControl = L.control.zoom({
    zoomInTitle: 'Zoomer',
    zoomOutTitle: 'Dézoomer',
    position: 'bottomright'
});
zoomControl.addTo(ftoTransfertsComm);

/**
 *  Legend control 
 */

var legendFtoTransfertsComm = L.control({ position: 'bottomleft' });

// Legend
legendFtoTransfertsComm.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 8, 20, 30, 37, 45, 50, 60, 70];
    labels = [];
    var nullColor = '#e0e0e0'
    div.innerHTML = '<b>Légende</b><br />Taux de primo-accédants (%)<br /><br />'
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColorFtoTransfertsComm(grades[i] + 0.01) + '"></i> ' +
            grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '<br>' : ' &ndash; 100');
    }
    div.innerHTML += '<br /><i style="background:' + nullColor + '"></i> Pas d\'information'

    return div;
};
legendFtoTransfertsComm.addTo(ftoTransfertsComm);


/**
 *  GeoJSON data
 */

var ftoTransfertsJson = L.geoJson(proprioData, { filter: function (feature, layer) { return !communesToRemove.includes(feature.properties.codgeo); }, style: styleFtoTransfertsComm, onEachFeature: onEachFeature, smoothFactor: 0 }).addTo(ftoTransfertsComm);

/**
 *  Info control
 */

var infoFtoTransfertsComm = L.control();

infoFtoTransfertsComm.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};


// method used to update the control based on feature properties
infoFtoTransfertsComm.update = function (props) {
    this._div.innerHTML = (props ?
        '<b>' + props.libgeo + ' (' + props.codgeo + ')</b><br />' +
        '----<br />' +
        'Taux de primo-accessions parmi les transferts : ' + props.tx_fto_t + '%<br />' +
        'Nombre de transferts : ' + props.nb_t + '<br />' +
        'dont primo-accession : ' + props.nb_t_fto + ' <br />' +
        'hors primo-accession : ' + props.nb_t_not_f + ' <br />'
        : 'Survolez une commune pour plus d\'informations');
};

infoFtoTransfertsComm.addTo(ftoTransfertsComm);


/**
 *  Styling
 */


// 9-class Greens from colorbrewer
// 9 classes chosen after Jenks breaks analysis and rounding

function getColorFtoTransfertsComm(d) {
    var palette = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'];
    var nullColor = '#e0e0e0';
    var jenksBreaks = [8, 20, 30, 37, 45, 50, 60, 70];
    if (d == null) { return nullColor };
    return d > jenksBreaks[7] ? palette[8] :
        d > jenksBreaks[6] ? palette[7] :
            d > jenksBreaks[5] ? palette[6] :
                d > jenksBreaks[4] ? palette[5] :
                    d > jenksBreaks[3] ? palette[4] :
                        d > jenksBreaks[2] ? palette[3] :
                            d > jenksBreaks[1] ? palette[2] :
                                d > jenksBreaks[0] ? palette[1] :
                                    palette[0];
};

// default style
function styleFtoTransfertsComm(feature) {
    return {
        opacity: 0, // border opacity
        fillColor: getColorFtoTransfertsComm(feature.properties.tx_fto_ct),
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
    infoFtoTransfertsComm.update(layer.feature.properties);
}

// back to initial style when not hovered anymore
function resetHighlight(e) {
    ftoTransfertsJson.resetStyle(e.target);
    infoFtoTransfertsComm.update();
}

// zoom to city when clicked
function zoomToFeature(e) {
    ftoTransfertsComm.fitBounds(e.target.getBounds());
}

// adding these features to map
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}