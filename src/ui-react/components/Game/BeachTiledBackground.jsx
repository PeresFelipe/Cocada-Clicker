import { useEffect, useRef } from "react";

const TILE_SIZE = 24;
const FRAME_DELAY_MS = 180;
const WATER_START_RATIO = 0.66;
const SHORE_BAND_TILES = 1;
const SAND_DETAIL_CHANCE = 0.055;
const MID_SAND_DETAIL_CHANCE = 0.08;
const WET_SAND_BAND_TILES = 2;

const tilesheetUrl = new URL(
  "../../../../assets/backgrounds/beach tilesheet/beach tilesheet.png",
  import.meta.url,
).href;

function sampleTileColor(ctx, tileX, tileY) {
  const baseX = tileX * TILE_SIZE;
  const baseY = tileY * TILE_SIZE;
  const points = [
    [baseX + 4, baseY + 4],
    [baseX + 12, baseY + 6],
    [baseX + 18, baseY + 8],
    [baseX + 8, baseY + 14],
    [baseX + 16, baseY + 16],
    [baseX + 6, baseY + 20],
  ];

  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;

  for (const [x, y] of points) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    r += pixel[0];
    g += pixel[1];
    b += pixel[2];
    a += pixel[3];
  }

  const count = points.length;
  return {
    r: r / count,
    g: g / count,
    b: b / count,
    a: a / count,
  };
}

function colorDistance(c1, c2) {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function hash2D(x, y) {
  const n = x * 374761393 + y * 668265263;
  const mixed = (n ^ (n >> 13)) * 1274126177;
  return ((mixed ^ (mixed >> 16)) >>> 0) / 4294967295;
}

function pickDistinctTiles(candidates, targetCount, minDistance) {
  const picked = [];
  for (const candidate of candidates) {
    const isDistinct = picked.every(
      (existing) => colorDistance(existing.color, candidate.color) > minDistance,
    );
    if (isDistinct) {
      picked.push(candidate);
    }
    if (picked.length >= targetCount) break;
  }
  return picked;
}

function pickTiles(sourceCanvas, cols, rows) {
  const ctx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return {
      sandTiles: [{ x: 0, y: 0 }],
      wetSandTiles: [{ x: 0, y: 0 }],
      detailTiles: [{ x: 0, y: 0 }],
      waterTiles: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
      ],
      shoreTiles: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
    };
  }

  const waterCandidates = [];
  const sandCandidates = [];
  const wetSandCandidates = [];
  const shoreCandidates = [];
  const detailCandidates = [];

  // Analyze the whole spritesheet to use a wider visual variety of tiles.
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const color = sampleTileColor(ctx, x, y);
      if (color.a < 200) continue;

      const blueDominance = color.b - Math.max(color.r, color.g);
      const warmDominance = color.r - color.b;

      if (blueDominance > 14) {
        waterCandidates.push({ x, y, color, score: blueDominance + color.g * 0.08 });
      }

      if (warmDominance > 8 && color.g > color.b) {
        const brightness = (color.r + color.g + color.b) / 3;
        const sandScore = warmDominance + color.r * 0.05 + color.g * 0.03;
        sandCandidates.push({ x, y, color, score: sandScore });

        const wetSandLike = brightness > 95 && brightness < 175;
        if (wetSandLike) {
          const wetScore = sandScore + (175 - brightness) * 0.5;
          wetSandCandidates.push({ x, y, color, score: wetScore });
        }

        const chroma = Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b);
        if (chroma > 18 && brightness > 70 && brightness < 235) {
          const detailScore = chroma + Math.abs(color.r - color.g) * 0.35;
          detailCandidates.push({ x, y, color, score: detailScore });
        }
      }

      const brightness = (color.r + color.g + color.b) / 3;
      const whiteFoamLike = brightness > 185 && color.b > 150 && Math.abs(color.r - color.g) < 32;
      if (whiteFoamLike) {
        shoreCandidates.push({ x, y, color, score: brightness + color.b * 0.1 });
      }
    }
  }

  waterCandidates.sort((a, b) => b.score - a.score);
  sandCandidates.sort((a, b) => b.score - a.score);
  wetSandCandidates.sort((a, b) => b.score - a.score);
  shoreCandidates.sort((a, b) => b.score - a.score);
  detailCandidates.sort((a, b) => b.score - a.score);

  const pickedWater = pickDistinctTiles(waterCandidates, 20, 3);
  const pickedSand = pickDistinctTiles(sandCandidates, 18, 3);
  const pickedWetSandRaw = pickDistinctTiles(wetSandCandidates, 14, 3);
  const pickedShore = pickDistinctTiles(shoreCandidates, 12, 2);
  const pickedDetailRaw = pickDistinctTiles(detailCandidates, 20, 3);
  const pickedWetSand = pickedWetSandRaw.filter(
    (wet) => !pickedWater.some((water) => water.x === wet.x && water.y === wet.y),
  );
  const pickedDetail = pickedDetailRaw.filter(
    (detail) => !pickedSand.some((sand) => sand.x === detail.x && sand.y === detail.y),
  );

  if (pickedWater.length === 0) {
    pickedWater.push({ x: 1, y: 0, color: { r: 80, g: 140, b: 200 } });
  }
  if (pickedSand.length === 0) {
    pickedSand.push({ x: 0, y: 0, color: { r: 230, g: 190, b: 120 } });
  }
  if (pickedWetSand.length === 0) {
    pickedWetSand.push(...pickedSand.slice(0, 4));
  }
  if (pickedShore.length === 0) {
    pickedShore.push(pickedWater[0]);
  }
  if (pickedDetail.length === 0) {
    pickedDetail.push(...pickedSand.slice(0, 3));
  }

  while (pickedWater.length < 6) {
    pickedWater.push(pickedWater[pickedWater.length - 1]);
  }
  while (pickedSand.length < 6) {
    pickedSand.push(pickedSand[pickedSand.length - 1]);
  }
  while (pickedWetSand.length < 6) {
    pickedWetSand.push(pickedWetSand[pickedWetSand.length - 1]);
  }
  while (pickedShore.length < 4) {
    pickedShore.push(pickedShore[pickedShore.length - 1]);
  }
  while (pickedDetail.length < 4) {
    pickedDetail.push(pickedDetail[pickedDetail.length - 1]);
  }

  return {
    sandTiles: pickedSand.map((tile) => ({ x: tile.x, y: tile.y })),
    wetSandTiles: pickedWetSand.map((tile) => ({ x: tile.x, y: tile.y })),
    detailTiles: pickedDetail.map((tile) => ({ x: tile.x, y: tile.y })),
    waterTiles: pickedWater.map((tile) => ({ x: tile.x, y: tile.y })),
    shoreTiles: pickedShore.map((tile) => ({ x: tile.x, y: tile.y })),
  };
}

function pickAnimatedVariant(pool, col, row, frame, speed = 1) {
  if (!pool.length) return null;
  const base = Math.floor(hash2D(col + frame * speed, row + frame) * pool.length);
  const index = (base + frame * speed) % pool.length;
  return pool[index];
}

function pickStaticVariant(pool, col, row, salt = 0) {
  if (!pool.length) return null;
  const index = Math.floor(hash2D(col * 17 + salt, row * 31 + salt) * pool.length) % pool.length;
  return pool[index];
}

export function BeachTiledBackground() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    image: null,
    cols: 0,
    rows: 0,
    sandTiles: [{ x: 0, y: 0 }],
    wetSandTiles: [{ x: 0, y: 0 }],
    detailTiles: [{ x: 0, y: 0 }],
    waterTiles: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
    ],
    shoreTiles: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ],
    frame: 0,
    lastFrameTime: 0,
    rafId: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    ctx.imageSmoothingEnabled = false;

    const image = new Image();
    image.src = tilesheetUrl;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };

    const drawTile = (tileX, tileY, destX, destY) => {
      const state = stateRef.current;
      if (!state.image) return;

      const sx = tileX * TILE_SIZE;
      const sy = tileY * TILE_SIZE;

      ctx.drawImage(state.image, sx, sy, TILE_SIZE, TILE_SIZE, destX, destY, TILE_SIZE, TILE_SIZE);
    };

    const render = (timestamp) => {
      const state = stateRef.current;
      if (!state.image) {
        state.rafId = window.requestAnimationFrame(render);
        return;
      }

      if (!state.lastFrameTime) {
        state.lastFrameTime = timestamp;
      }

      if (timestamp - state.lastFrameTime >= FRAME_DELAY_MS) {
        state.frame = (state.frame + 1) % 16;
        state.lastFrameTime = timestamp;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      const colsToDraw = Math.ceil(width / TILE_SIZE) + 1;
      const rowsToDraw = Math.ceil(height / TILE_SIZE) + 1;
      const waterStartRow = Math.floor(rowsToDraw * WATER_START_RATIO);

      ctx.clearRect(0, 0, width, height);

      for (let row = 0; row < rowsToDraw; row += 1) {
        for (let col = 0; col < colsToDraw; col += 1) {
          const x = col * TILE_SIZE;
          const y = row * TILE_SIZE;
          const inWater = row >= waterStartRow;
          const inShore = row >= waterStartRow - SHORE_BAND_TILES && row < waterStartRow;
          const inWetSandBand =
            row >= waterStartRow - SHORE_BAND_TILES - WET_SAND_BAND_TILES &&
            row < waterStartRow - SHORE_BAND_TILES;

          if (inWater) {
            const waterTile = pickAnimatedVariant(state.waterTiles, col, row, state.frame, 2);
            if (waterTile) drawTile(waterTile.x, waterTile.y, x, y);
            continue;
          }

          if (inShore) {
            const foamPulse = Math.floor(hash2D(col * 5 + 3, row * 7 + 9) * 3);
            if (foamPulse === 0) {
              const shoreTile = pickStaticVariant(state.shoreTiles, col, row, 101);
              if (shoreTile) drawTile(shoreTile.x, shoreTile.y, x, y);
            } else if (foamPulse === 1) {
              const waterTile = pickAnimatedVariant(state.waterTiles, col, row, state.frame, 2);
              if (waterTile) drawTile(waterTile.x, waterTile.y, x, y);
            } else {
              const sandTile = pickStaticVariant(state.sandTiles, col, row, 67);
              if (sandTile) drawTile(sandTile.x, sandTile.y, x, y);
            }
            continue;
          }

          if (inWetSandBand) {
            const wetDetailSpot = hash2D(col * 19 + 5, row * 11 + 13) < MID_SAND_DETAIL_CHANCE;
            if (wetDetailSpot) {
              const wetDetailTile = pickStaticVariant(state.detailTiles, col, row, 317);
              if (wetDetailTile) {
                drawTile(wetDetailTile.x, wetDetailTile.y, x, y);
                continue;
              }
            }

            const wetSandTile = pickStaticVariant(state.wetSandTiles, col, row, 149);
            if (wetSandTile) {
              drawTile(wetSandTile.x, wetSandTile.y, x, y);
              continue;
            }
          }

          const isDetailSpot =
            row < waterStartRow - SHORE_BAND_TILES &&
            hash2D(col * 13 + 7, row * 17 + 11) < SAND_DETAIL_CHANCE;

          if (isDetailSpot) {
            const detailTile = pickStaticVariant(state.detailTiles, col, row, 211);
            if (detailTile) {
              drawTile(detailTile.x, detailTile.y, x, y);
              continue;
            }
          }

          const sandTile = pickStaticVariant(state.sandTiles, col, row, 67);
          if (sandTile) drawTile(sandTile.x, sandTile.y, x, y);
        }
      }

      state.rafId = window.requestAnimationFrame(render);
    };

    image.onload = () => {
      resizeCanvas();

      const cols = Math.floor(image.width / TILE_SIZE);
      const rows = Math.floor(image.height / TILE_SIZE);

      const sourceCanvas = document.createElement("canvas");
      sourceCanvas.width = image.width;
      sourceCanvas.height = image.height;
      const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
      sourceCtx?.drawImage(image, 0, 0);

      const { sandTiles, wetSandTiles, detailTiles, waterTiles, shoreTiles } = pickTiles(
        sourceCanvas,
        cols,
        rows,
      );

      stateRef.current.image = image;
      stateRef.current.cols = cols;
      stateRef.current.rows = rows;
      stateRef.current.sandTiles = sandTiles;
      stateRef.current.wetSandTiles = wetSandTiles;
      stateRef.current.detailTiles = detailTiles;
      stateRef.current.waterTiles = waterTiles;
      stateRef.current.shoreTiles = shoreTiles;
      stateRef.current.frame = 0;
      stateRef.current.lastFrameTime = 0;

      if (!stateRef.current.rafId) {
        stateRef.current.rafId = window.requestAnimationFrame(render);
      }
    };

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (stateRef.current.rafId) {
        window.cancelAnimationFrame(stateRef.current.rafId);
      }
      stateRef.current.rafId = 0;
    };
  }, []);

  return <canvas ref={canvasRef} className="beach-tilemap-bg" aria-hidden="true" />;
}

export default BeachTiledBackground;
