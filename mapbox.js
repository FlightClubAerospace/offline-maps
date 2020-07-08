(async () => {
    const data = await (await fetch('coastline.geojson')).json();

    mapboxgl.accessToken = 'pk.eyJ1IjoiMTkwbiIsImEiOiJja2JsYW5qcTYxNTI3MnlrMG53YmlpYzVjIn0.u7_fXPBlr9FvBkKByOF9lg';
    const map = new mapboxgl.Map({
        container: 'map',
        // style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
        center: [-122.44, 37.77], // starting position [lng, lat]
        zoom: 9 // starting zoom
    });

    map.addSource('bleh', {
        type: 'geojson',
        data,
    });

    map.addLayer({
        id: 'bleh',
        type: 'fill',
        source: 'bleh',
        layout: {},
        paint: {
            'fill-color': '#f00',
            'fill-opacity': 1,
        },
    });
})();
