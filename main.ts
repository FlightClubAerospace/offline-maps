import TileMap, { buildTileGrid } from './map';

const map = new TileMap(document.getElementById('map'));
map.init();
map.update(38, -122.3, 12);

function animate() {
    requestAnimationFrame(animate);
    map.update(map.lat - 0.0005, map.long - 0.0001, map.zoom);
}

animate();
