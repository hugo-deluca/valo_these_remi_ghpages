/**
 *  Creating map 
 */

var growthMap = L.map("growthMap", { center: [46.37730064858146, 2.1533203125000004], zoom: 6, zoomControl: false, preferCanvas: false, })

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

lightmatter.addTo(growthMap);

layerControl.addTo(growthMap);

/**
 *  Zoom control 
 */
zoomControl = L.control.zoom({
    zoomInTitle: 'Zoomer',
    zoomOutTitle: 'Dézoomer',
    position: 'bottomright'
});
zoomControl.addTo(growthMap);

/**
 *  Legend control 
 */

var legendGrowth = L.control({ position: 'bottomleft' });

// Legend
legendGrowth.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-6, -1.2, -0.4, 0.3, 1.3, 4.0];
    labels = [];
    var nullColor = '#b9b9b9'
    div.innerHTML = '<b>Légende</b><br />Taux de croissance annuel moyen (%)<br /><br />'
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColorGrowth(grades[i] + 0.01) + '"></i> ' +
            grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '<br>' : ' et +');
    }
    div.innerHTML += '<br /><i style="background:' + nullColor + '"></i> Pas d\'information'

    return div;
};
legendGrowth.addTo(growthMap);


/**
 *  GeoJSON data
 */

var growthJson = L.geoJson(proprioData, { style: styleGrowth, onEachFeature: onEachFeature, smoothFactor: 0 }).addTo(growthMap);

/**
 *  Info control
 */

var infoGrowth = L.control();

infoGrowth.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};


// method used to update the control based on feature properties
infoGrowth.update = function (props) {
    this._div.innerHTML = (props ?
        '<b>' + props.libgeo + ' (' + props.codgeo + ')</b><br />' +
        '----<br />' +
        'Taux de croissance annuel moyen : ' + Math.round(props.growth_rat * 100) / 100 + ' %<br />' +
        'Estimation du prix moyen (2019) : ' + Math.round(props.avg_pm2_20 * 100) / 100 + ' €/m²<br />' +
        'Estimation du prix moyen (2011) : ' + Math.round(props.avg_pm2_01 * 100) / 100 + ' €/m²<br />'
        : 'Survolez une commune pour plus d\'informations');
};

infoGrowth.addTo(growthMap);


/**
 *  Styling
 */


// 6-class Oranges from colorbrewer, from light to dark orange
// 6 classes chosen after Jenks breaks analysis and rounding

function getColorGrowth(d) {
    var palette = ['#d73027', '#fc8d59', '#fee090', '#e0f3f8', '#91bfdb', '#4575b4'];
    var nullColor = '#b9b9b9';
    var jenksBreaks = [-1.2, -0.4, 0.3, 1.3, 4.0];
    if (d == null) { return nullColor };
    return d > jenksBreaks[4] ? palette[0] :
        d > jenksBreaks[3] ? palette[1] :
            d > jenksBreaks[2] ? palette[2] :
                d > jenksBreaks[1] ? palette[3] :
                    d > jenksBreaks[0] ? palette[4] :
                        palette[5];
};

// default style
function styleGrowth(feature) {
    return {
        opacity: 0, // border opacity
        fillColor: getColorGrowth(feature.properties.growth_rat),
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
    infoGrowth.update(layer.feature.properties);
}

// back to initial style when not hovered anymore
function resetHighlight(e) {
    growthJson.resetStyle(e.target);
    infoGrowth.update();
}

// zoom to city when clicked
function zoomToFeature(e) {
    growthMap.fitBounds(e.target.getBounds());
}

// adding these features to map
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}