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

export default class TileMap {
    public lat?: number;
    public long?: number;
    public zoom?: number;
    public width?: number;
    public height?: number;

    private outerContainer?: HTMLElement;
    private innerContainer?: HTMLElement;
    private rows?: HTMLElement[];
    private tiles?: HTMLImageElement[][];

    constructor(public root: HTMLElement) {}

    init(): void {
        this.width = this.root.clientWidth;
        this.height = this.root.clientHeight;

        const tileWidth = Math.ceil(this.width / TILE_RESOLUTION) + 1,
            tileHeight = Math.ceil(this.height / TILE_RESOLUTION) + 1;

        this.root.innerHTML = '';
        this.outerContainer = document.createElement('div');
        this.outerContainer.classList.add('map-outer-container');
        this.innerContainer = document.createElement('div');
        this.innerContainer.classList.add('map-inner-container');
        this.outerContainer.appendChild(this.innerContainer);

        this.rows = [];
        this.tiles = [];

        for (let i = 0; i < tileHeight; i++) {
            const row = document.createElement('div');
            row.classList.add('map-row');
            this.rows.push(row);
            this.tiles.push([]);

            for (let j = 0; j < tileWidth; j++) {
                const tile = document.createElement('img');
                tile.style.left = `${j * TILE_RESOLUTION}px`;
                tile.decoding = 'async';
                tile.onerror = () => {
                    tile.src = 'http://via.placeholder.com/256';
                };
                this.tiles[i].push(tile);
                row.appendChild(tile);
            }

            this.innerContainer.appendChild(row);
        }

        this.root.appendChild(this.outerContainer);
    }

    update(lat: number, long: number, zoom: number): void {
        this.lat = lat;
        this.long = long;
        this.zoom = zoom;
        const tileGrid = buildTileGrid(lat, long, zoom, this.width, this.height);

        for (let y = 0; y <= (tileGrid.maxTileY - tileGrid.minTileY); y++) {
            for (let x = 0; x <= (tileGrid.maxTileX - tileGrid.minTileX); x++) {
                this.tiles[y][x].src = `/tiles/${zoom}/${x + tileGrid.minTileX}/${y + tileGrid.minTileY}.png`;
            }
        }

        this.innerContainer.style.left = `${tileGrid.offsetX}px`;
        this.innerContainer.style.top = `${tileGrid.offsetY}px`;
    }
}
