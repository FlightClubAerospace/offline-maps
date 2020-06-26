import { buildTileGrid } from './map';

document.getElementById('tileviewer').onsubmit = (e) => {
    e.preventDefault();

    const lat = parseFloat(document.getElementById('lat').value),
        long = parseFloat(document.getElementById('long').value),
        zoom = parseInt(document.getElementById('zoom').value);

    const grid = buildTileGrid(lat, long, zoom, 400, 400);

    const tiles = document.getElementById('tiles');
    tiles.innerHTML = '';

    for (let y = grid.minTileY; y <= grid.maxTileY; y++) {
        const row = document.createElement('div');
        row.classList.add('row');
        for (let x = grid.minTileX; x <= grid.maxTileX; x++) {
            const tile = document.createElement('img');
            tile.src = `/tiles/${zoom}/${x}/${y}.png`;
            row.appendChild(tile);
        }
        tiles.appendChild(row);
    }

    tiles.style.left = `${grid.offsetX}px`;
    tiles.style.top = `${grid.offsetY}px`;
};


