export const TILE_RESOLUTION = 256;

function getTileXY(lat: number, long: number, zoom: number): [number, number, number, number] {
    // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Derivation_of_tile_names
    const latRad = lat / 180 * Math.PI,
        longRad = long / 180 * Math.PI;
    let x = longRad,
        y = Math.asinh(Math.tan(latRad));

    x = (1 + (x / Math.PI)) / 2;
    y = (1 - (y / Math.PI)) / 2;

    const n = 2 ** zoom;
    x *= n;
    y *= n;
    const tileX = Math.floor(x),
        tileY = Math.floor(y),
        xInTile = x - tileX,
        yInTile = y - tileY;
    return [tileX, tileY, xInTile, yInTile];
}

function paddingPixelsToTiles(px: number): number {
    return Math.max(0, Math.ceil(px / TILE_RESOLUTION));
}

export interface TileGridDisplay {
    offsetX: number;
    offsetY: number;
    minTileX: number;
    minTileY: number;
    maxTileX: number;
    maxTileY: number;
}

export function buildTileGrid(lat: number, long: number, zoom: number, displayWidth: number, displayHeight: number): TileGridDisplay {
    const [tileX, tileY, relX, relY] = getTileXY(lat, long, zoom);

    const leftPadding = (displayWidth / 2) - (relX * TILE_RESOLUTION),
        leftPaddingTiles = paddingPixelsToTiles(leftPadding),
        rightPadding = (displayWidth / 2) - ((1 - relX) * TILE_RESOLUTION),
        rightPaddingTiles = paddingPixelsToTiles(rightPadding),
        topPadding = (displayHeight / 2) - (relY * TILE_RESOLUTION),
        topPaddingTiles = paddingPixelsToTiles(topPadding),
        bottomPadding = (displayHeight / 2) - ((1 - relY) * TILE_RESOLUTION),
        bottomPaddingTiles = paddingPixelsToTiles(bottomPadding);

    const offsetX = leftPadding - (leftPaddingTiles * TILE_RESOLUTION),
        offsetY = topPadding - (topPaddingTiles * TILE_RESOLUTION);

    return {
        offsetX,
        offsetY,
        minTileX: tileX - leftPaddingTiles,
        minTileY: tileY - topPaddingTiles,
        maxTileX: tileX + rightPaddingTiles,
        maxTileY: tileY + bottomPaddingTiles,
    };
}
