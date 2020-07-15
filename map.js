const myMap = L.map('map').setView([37.7706, -122.3782], 13);

const path = L.polyline([], { color: '#000080c0' }).addTo(myMap);
L.control.scale().addTo(myMap);

const offlineTiles = L.tileLayer('/static/tiles/{z}/{x}/{y}.png', {
    // UPDATE THIS FOR WHICHEVER TILES WE ACTUALLY USE
    attribution: 'Attribution',
    maxZoom: 15,
    tileSize: 256,
});

const onlineTiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiMTkwbiIsImEiOiJja2JsYW5qcTYxNTI3MnlrMG53YmlpYzVjIn0.u7_fXPBlr9FvBkKByOF9lg',
});

offlineTiles.addTo(myMap);

function convertToDegrees(degrees, minutes) {
    if (degrees > 0) {
        return degrees + minutes / 60;
    } else {
        return degrees - minutes / 60;
    }
}

// https://www.freecodecamp.org/news/debounce-explained-how-to-make-your-javascript-wait-for-your-user-to-finish-typing-2/
function debounce(callback, delay) {
    let timeout = null;

    return function(...args) {
        if (timeout !== null) return;
        const debouncedThis = this;
        timeout = setTimeout(function() {
            callback.apply(debouncedThis, args);
            timeout = null;
        }, delay);
    };
}

const LockControl = L.Control.extend({
    initialize(options) {
        this.locked = true;
        this.mouseDown = false;
    },

    buttonClicked(e) {
        this.locked = true;
        e.target.style.display = 'none';
    },

    onAdd(map) {
        this.button = L.DomUtil.create('button');
        this.button.style.display = 'none';
        this.button.innerHTML = 'Center display';

        map.on('mousedown', () => this.mouseDown = true);
        map.on('mouseup', () => this.mouseDown = false);
        map.on('mousemove', () => {
            if (this.mouseDown) {
                this.locked = false;
                this.button.style.display = 'inline';
            }
        });

        L.DomEvent.on(this.button, 'click', this.buttonClicked, this);

        return this.button;
    },

    onRemove() {
        L.DomEvent.off(this.button, 'click', this.buttonClicked, this);
    },
});

const lockControl = new LockControl().addTo(myMap);

const updateMap = debounce(obj => {
    const lat = convertToDegrees(obj.data.position.latDeg, obj.data.position.latMin),
        long = convertToDegrees(obj.data.position.longDeg, obj.data.position.longMin);

    path.addLatLng([lat, long]);
    if (lockControl.locked) {
        myMap.setView([lat, long]);
    }
}, 1000);

const ws = new WebSocket('ws://localhost:8000');
ws.onmessage = e => {
    // console.log('onmessage', e.data);

    try {
        const obj = JSON.parse(e.data);
        if (obj.type == 'json' && obj.data.hasOwnProperty('position')) {
            updateMap(obj);
        }
    } catch (e) {
        console.log(`error: ${e}`);
    }
};
