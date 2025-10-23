(() => {
  'use strict';

  const boardCv = document.getElementById('board');
  if (!boardCv) return;

  const ctx = boardCv.getContext('2d');
  const nextCv = document.getElementById('next');
  const holdCv = document.getElementById('hold');
  const nextCtx = nextCv?.getContext('2d');
  const holdCtx = holdCv?.getContext('2d');
  const rootEl = document.documentElement;
  const headerEl = document.querySelector('.site-header');
  const boardWrap = boardCv.closest('.board-wrap');
  const mainEl = document.querySelector('main');
  const mobileControls = boardWrap?.querySelector('.mobile');

  const elScore = document.getElementById('score');
  const elLines = document.getElementById('lines');
  const elLevel = document.getElementById('level');
  const elHiscore = document.getElementById('hiscore');
  const elOverlay = document.getElementById('overlay');
  const elStartPause = document.getElementById('startPause');
  const elReset = document.getElementById('reset');
  const elFace = document.getElementById('face');

  const mkLeft = document.getElementById('mk-left');
  const mkRight = document.getElementById('mk-right');
  const mkRotL = document.getElementById('mk-rotL');
  const mkRotR = document.getElementById('mk-rotR');
  const mkDown = document.getElementById('mk-down');
  const mkHard = document.getElementById('mk-hard');

  const W = 10;
  const H = 20;
  let cellSize = 28;
  let previewCellSize = 22;
  let holdCellSize = 24;
  const PREVIEWS = 3;
  const KEY_REPEAT = { delay: 160, interval: 45 };

  const COLORS = {
    I: '#00BCD4',
    O: '#FFC107',
    T: '#9C27B0',
    S: '#4CAF50',
    Z: '#F44336',
    J: '#3F51B5',
    L: '#FF9800'
  };

  const SHAPES = {
    I: [['....', 'XXXX', '....', '....']],
    O: [['.XX.', '.XX.', '....', '....']],
    T: [['.X..', 'XXX.', '....', '....']],
    S: [['.XX.', 'XX..', '....', '....']],
    Z: [['XX..', '.XX.', '....', '....']],
    J: [['X...', 'XXX.', '....', '....']],
    L: [['..X.', 'XXX.', '....', '....']]
  };

  const SCORE_LINES = [0, 100, 300, 500, 800];
  const PREVENT_DEFAULT_CODES = new Set([
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Space', 'KeyA', 'KeyD', 'KeyS', 'KeyW',
    'KeyQ', 'KeyE', 'KeyZ', 'KeyX', 'KeyC',
    'ShiftLeft', 'ShiftRight'
  ]);

  const repeaters = {
    left: { codes: ['ArrowLeft', 'KeyA'], action: () => tryShift(-1) },
    right: { codes: ['ArrowRight', 'KeyD'], action: () => tryShift(1) },
    down: { codes: ['ArrowDown', 'KeyS'], action: () => softDrop() }
  };

  const codeToRepeater = new Map();
  Object.entries(repeaters).forEach(([name, data]) => {
    data.codes.forEach(code => codeToRepeater.set(code, name));
  });

  ctx.imageSmoothingEnabled = false;
  if (nextCtx) nextCtx.imageSmoothingEnabled = false;
  if (holdCtx) holdCtx.imageSmoothingEnabled = false;

  function syncViewportMetrics() {
    if (headerEl) {
      rootEl.style.setProperty('--header-height', `${headerEl.offsetHeight}px`);
    }
  }

  syncViewportMetrics();

  if ('ResizeObserver' in window && headerEl) {
    const headerObserver = new ResizeObserver(syncViewportMetrics);
    headerObserver.observe(headerEl);
  }

  if ('ResizeObserver' in window && boardWrap) {
    const boardObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        updateBoardSizing();
        draw();
        drawNext();
        drawHold();
      });
    });
    boardObserver.observe(boardWrap);
  }

  let board = createBoard();
  let queue = [];
  let current = null;
  let hold = null;
  let canHold = true;
  let score = 0;
  let lines = 0;
  let level = 1;
  let hiscore = 0;
  let running = false;
  let paused = false;
  let gameOver = false;
  let dropInterval = 1000;
  let lastTime = 0;
  let acc = 0;

  const activeRepeats = new Map();

  function createBoard() {
    return Array.from({ length: H }, () => Array(W).fill(null));
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function refillBag() {
    const bag = Object.keys(SHAPES);
    shuffle(bag);
    queue.push(...bag);
  }

  function ensureQueue() {
    while (queue.length < PREVIEWS + 3) {
      refillBag();
    }
  }

  function nextFromBag() {
    ensureQueue();
    return queue.shift();
  }

  function newPiece(type) {
    const matrix = SHAPES[type][0].map(row => row);
    const width = matrix[0].length;
    const x = Math.floor((W - width) / 2);
    const y = -1;
    return { type, color: COLORS[type], matrix, x, y };
  }

  function matrixCells(matrix) {
    const cells = [];
    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r];
      for (let c = 0; c < row.length; c++) {
        if (row[c] === 'X') cells.push([c, r]);
      }
    }
    return cells;
  }

  function collides(piece, dx = 0, dy = 0, matrix = null) {
    const mat = matrix || piece.matrix;
    const cells = matrixCells(mat);
    for (const [cx, cy] of cells) {
      const x = piece.x + cx + dx;
      const y = piece.y + cy + dy;
      if (x < 0 || x >= W || y >= H) return true;
      if (y >= 0 && board[y][x]) return true;
    }
    return false;
  }

  function rotateCW(matrix) {
    const N = matrix.length;
    const res = Array.from({ length: N }, () => Array(N).fill('.'));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        res[c][N - 1 - r] = matrix[r][c];
      }
    }
    return res.map(row => row.join(''));
  }

  function rotateCCW(matrix) {
    const N = matrix.length;
    const res = Array.from({ length: N }, () => Array(N).fill('.'));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        res[N - 1 - c][r] = matrix[r][c];
      }
    }
    return res.map(row => row.join(''));
  }

  function tryShift(dx) {
    if (!canControl()) return false;
    if (!collides(current, dx, 0)) {
      current.x += dx;
      draw();
      return true;
    }
    return false;
  }

  function softDrop() {
    if (!canControl()) return false;
    if (!collides(current, 0, 1)) {
      current.y += 1;
      score += 1;
      updateStats();
      draw();
      return true;
    }
    return false;
  }

  function hardDrop() {
    if (!canControl()) return;
    let distance = 0;
    while (!collides(current, 0, distance + 1)) distance++;
    current.y += distance;
    score += distance * 2;
    updateStats();
    acc = 0;
    if (mergePiece()) {
      clearLines();
      spawn();
    }
    draw();
  }

  function tryRotate(dir) {
    if (!canControl()) return;
    const rotated = dir > 0 ? rotateCW(current.matrix) : rotateCCW(current.matrix);
    const kicks = [[0, 0], [1, 0], [-1, 0], [2, 0], [-2, 0], [0, -1]];
    for (const [kx, ky] of kicks) {
      if (!collides(current, kx, ky, rotated)) {
        current.matrix = rotated;
        current.x += kx;
        current.y += ky;
        draw();
        return;
      }
    }
  }

  function holdPiece() {
    if (!canControl() || !canHold) return;
    canHold = false;
    if (!hold) {
      hold = current.type;
      drawHold();
      spawn();
    } else {
      const swapType = hold;
      hold = current.type;
      current = newPiece(swapType);
      if (collides(current, 0, 0)) {
        setGameOver('Top bereikt — je kunt niet verder bouwen.');
        return;
      }
      drawHold();
      draw();
    }
  }

  function mergePiece() {
    const cells = matrixCells(current.matrix);
    for (const [cx, cy] of cells) {
      if (current.y + cy < 0) {
        setGameOver('Top bereikt — je kunt niet verder bouwen.');
        return false;
      }
    }
    for (const [cx, cy] of cells) {
      const x = current.x + cx;
      const y = current.y + cy;
      if (y >= 0) board[y][x] = current.color;
    }
    return true;
  }

  function clearLines() {
    let cleared = 0;
    outer: for (let r = H - 1; r >= 0; r--) {
      for (let c = 0; c < W; c++) {
        if (!board[r][c]) continue outer;
      }
      board.splice(r, 1);
      board.unshift(Array(W).fill(null));
      cleared++;
      r++;
    }
    if (cleared > 0) {
      lines += cleared;
      const previousLevel = level;
      score += SCORE_LINES[cleared] * previousLevel;
      const newLevel = Math.max(1, Math.floor(lines / 10) + 1);
      if (newLevel !== level) {
        level = newLevel;
        adjustSpeed();
      }
      updateStats();
    }
  }

  function adjustSpeed() {
    dropInterval = Math.max(80, 1000 - (level - 1) * 75);
  }

  function updateBoardSizing() {
    if (!boardWrap) return;
    const wrapStyles = getComputedStyle(boardWrap);
    const padX = (parseFloat(wrapStyles.paddingLeft) || 0) + (parseFloat(wrapStyles.paddingRight) || 0);
    const padY = (parseFloat(wrapStyles.paddingTop) || 0) + (parseFloat(wrapStyles.paddingBottom) || 0);
    const wrapWidth = Math.max(160, (boardWrap.clientWidth || (boardCv.parentElement?.clientWidth ?? boardCv.width)) - padX);
    const rect = boardWrap.getBoundingClientRect();
    let mobileHeight = 0;
    if (mobileControls) {
      const mobileDisplay = getComputedStyle(mobileControls).display;
      if (mobileDisplay !== 'none') {
        const mobileStyles = getComputedStyle(mobileControls);
        mobileHeight = mobileControls.offsetHeight + (parseFloat(mobileStyles.marginTop) || 0) + (parseFloat(mobileStyles.marginBottom) || 0);
      }
    }
    const mainStyles = mainEl ? getComputedStyle(mainEl) : null;
    const bottomPadding = mainStyles ? (parseFloat(mainStyles.paddingBottom) || 0) : 0;
    const reserved = Math.max(16, mobileHeight + bottomPadding + 12);
    const availableHeight = Math.max(240, window.innerHeight - rect.top - reserved - padY);
    const sizeCandidate = Math.floor(Math.min(wrapWidth / W, availableHeight / H));
    const newSize = Math.max(16, Math.min(48, sizeCandidate));
    if (!Number.isFinite(newSize) || newSize <= 0) return;
    cellSize = newSize;
    const width = cellSize * W;
    const height = cellSize * H;
    if (boardCv.width !== width || boardCv.height !== height) {
      boardCv.width = width;
      boardCv.height = height;
    }
    boardCv.style.width = `${width}px`;
    boardCv.style.height = `${height}px`;
    ctx.imageSmoothingEnabled = false;

    previewCellSize = Math.max(16, Math.min(28, Math.round(cellSize * 0.8)));
    holdCellSize = Math.max(16, Math.min(32, Math.round(cellSize * 0.9)));

    if (nextCv && nextCtx) {
      const cols = 4;
      const rows = 4;
      const blockWidth = cols * previewCellSize;
      const blockHeight = rows * previewCellSize;
      const horizontalPadding = Math.round(previewCellSize * 1.5);
      const topPadding = Math.round(previewCellSize * 0.75);
      const bottomPadding = Math.round(previewCellSize * 1.1);
      const gapY = Math.max(Math.round(previewCellSize * 0.9), Math.round(previewCellSize * 0.6));
      nextCv.width = blockWidth + horizontalPadding * 2;
      nextCv.height = topPadding + PREVIEWS * blockHeight + Math.max(0, PREVIEWS - 1) * gapY + bottomPadding;
      nextCtx.imageSmoothingEnabled = false;
    }

    if (holdCv && holdCtx) {
      const padding = Math.round(holdCellSize * 1.5);
      const dimension = 4 * holdCellSize + padding * 2;
      holdCv.width = dimension;
      holdCv.height = dimension;
      holdCtx.imageSmoothingEnabled = false;
    }
  }

  function updateStats() {
    elScore.textContent = String(score);
    elLines.textContent = String(lines);
    elLevel.textContent = String(level);
  }

  function drawGrid() {
    const cs = getComputedStyle(document.documentElement);
    const bg = (cs.getPropertyValue('--board-bg') || '#e9eef7').trim();
    const grid = (cs.getPropertyValue('--grid') || '#d3dae6').trim();
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W * cellSize, H * cellSize);
    ctx.strokeStyle = grid;
    ctx.lineWidth = 1;
    for (let x = 1; x < W; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize + 0.5, 0);
      ctx.lineTo(x * cellSize + 0.5, H * cellSize);
      ctx.stroke();
    }
    for (let y = 1; y < H; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize + 0.5);
      ctx.lineTo(W * cellSize, y * cellSize + 0.5);
      ctx.stroke();
    }
  }

  function drawCell(col, row, color, context, size) {
    const x = col * size;
    const y = row * size;
    context.fillStyle = color;
    context.fillRect(x, y, size, size);
    const grad = context.createLinearGradient(x, y, x, y + size);
    grad.addColorStop(0, 'rgba(255,255,255,.35)');
    grad.addColorStop(1, 'rgba(0,0,0,.12)');
    context.fillStyle = grad;
    context.fillRect(x, y, size, size);
    context.strokeStyle = 'rgba(0,0,0,.18)';
    context.lineWidth = 1;
    context.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
  }

  function renderPiece(piece, context, size) {
    const cells = matrixCells(piece.matrix);
    for (const [cx, cy] of cells) {
      const x = piece.x + cx;
      const y = piece.y + cy;
      if (y >= 0) drawCell(x, y, piece.color, context, size);
    }
  }

  function getGhostPiece() {
    if (!current) return null;
    const ghost = { ...current };
    while (!collides(ghost, 0, 1)) ghost.y += 1;
    return ghost;
  }

  function draw() {
    drawGrid();
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        const color = board[r][c];
        if (color) drawCell(c, r, color, ctx, cellSize);
      }
    }
    const ghost = getGhostPiece();
    if (ghost && current && ghost.y !== current.y) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      renderPiece(ghost, ctx, cellSize);
      ctx.restore();
    }
    if (current) {
      renderPiece(current, ctx, cellSize);
    }
  }

  function drawMini(context, type, size) {
    if (!context) return;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    if (!type) return;
    const matrix = SHAPES[type][0];
    const cells = matrixCells(matrix);
    const cols = 4;
    const rows = 4;
    const totalWidth = cols * size;
    const totalHeight = rows * size;
    const offsetX = Math.floor((context.canvas.width - totalWidth) / 2 / size);
    const offsetY = Math.floor((context.canvas.height - totalHeight) / 2 / size);
    for (const [cx, cy] of cells) {
      drawCell(offsetX + cx, offsetY + cy, COLORS[type], context, size);
    }
  }

  function drawNext() {
    if (!nextCtx || !nextCv) return;
    nextCtx.clearRect(0, 0, nextCv.width, nextCv.height);
    const cols = 4;
    const rows = 4;
    const blockWidth = cols * previewCellSize;
    const blockHeight = rows * previewCellSize;
    const horizontalPadding = Math.round(previewCellSize * 1.5);
    const topPadding = Math.round(previewCellSize * 0.75);
    const gapY = Math.max(Math.round(previewCellSize * 0.9), Math.round(previewCellSize * 0.6));
    const offsetCols = horizontalPadding / previewCellSize;
    let currentY = topPadding;
    queue.slice(0, PREVIEWS).forEach((type, index) => {
      const matrix = SHAPES[type][0];
      const cells = matrixCells(matrix);
      const offsetRows = currentY / previewCellSize;
      for (const [cx, cy] of cells) {
        drawCell(offsetCols + cx, offsetRows + cy, COLORS[type], nextCtx, previewCellSize);
      }
      currentY += blockHeight;
      if (index < PREVIEWS - 1) {
        currentY += gapY;
      }
    });
  }

  function drawHold() {
    drawMini(holdCtx, hold, holdCellSize);
  }

  function spawn() {
    const type = nextFromBag();
    current = newPiece(type);
    canHold = true;
    drawNext();
    if (collides(current, 0, 0)) {
      setGameOver('Top bereikt — je kunt niet verder bouwen.');
      return;
    }
    draw();
  }

  function tick() {
    if (!current) return;
    if (!collides(current, 0, 1)) {
      current.y += 1;
    } else if (mergePiece()) {
      clearLines();
      spawn();
    }
    draw();
  }

  function update(time) {
    if (!running || paused || gameOver) return;
    if (!lastTime) lastTime = time;
    const dt = time - lastTime;
    lastTime = time;
    acc += dt;
    while (acc >= dropInterval) {
      acc -= dropInterval;
      tick();
      if (gameOver) return;
    }
    requestAnimationFrame(update);
  }

  function canControl() {
    return running && !paused && !gameOver && current;
  }

  function setOverlay(html, show = true) {
    elOverlay.innerHTML = html;
    elOverlay.style.display = show ? 'flex' : 'none';
  }

  function resetOverlay() {
    setOverlay('', false);
  }

  function setGameOver(message) {
    gameOver = true;
    running = false;
    paused = false;
    stopAllRepeats();
    elStartPause.textContent = '▶️ Opnieuw';
    elFace.textContent = '😵';
    setOverlay(`<div>${message || 'Game Over'}</div><small>Druk op <span class="kbd">Spatie</span> of <span class="kbd">Enter</span> om opnieuw te starten</small>`);
    if (score > hiscore) {
      hiscore = score;
      try {
        localStorage.setItem('tetris_hiscore', String(hiscore));
      } catch (err) {
        console.warn('Kan high score niet opslaan', err);
      }
      elHiscore.textContent = String(hiscore);
    }
  }

  function stopAllRepeats() {
    for (const name of [...activeRepeats.keys()]) {
      endRepeat(name);
    }
  }

  function beginRepeat(name) {
    if (!canControl()) return;
    const data = repeaters[name];
    if (!data) return;
    endRepeat(name);
    data.action();
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (!canControl()) {
          endRepeat(name);
          return;
        }
        data.action();
      }, KEY_REPEAT.interval);
      activeRepeats.set(name, { interval });
    }, KEY_REPEAT.delay);
    activeRepeats.set(name, { timeout });
  }

  function endRepeat(name) {
    const handle = activeRepeats.get(name);
    if (!handle) return;
    if (handle.timeout) clearTimeout(handle.timeout);
    if (handle.interval) clearInterval(handle.interval);
    activeRepeats.delete(name);
  }

  function start() {
    if (gameOver) {
      reset();
    }
    if (running && !paused) return;
    running = true;
    paused = false;
    stopAllRepeats();
    resetOverlay();
    elStartPause.textContent = '⏸️ Pauze';
    elFace.textContent = '🙂';
    lastTime = 0;
    acc = 0;
    requestAnimationFrame(update);
  }

  function pause() {
    if (!running || gameOver) return;
    paused = true;
    running = false;
    stopAllRepeats();
    elStartPause.textContent = '▶️ Hervat';
    setOverlay('<div>Gepauzeerd</div><small>Druk op <span class="kbd">P</span> om door te gaan</small>');
  }

  function reset() {
    updateBoardSizing();
    board = createBoard();
    queue = [];
    ensureQueue();
    current = null;
    hold = null;
    canHold = true;
    score = 0;
    lines = 0;
    level = 1;
    running = false;
    paused = false;
    gameOver = false;
    lastTime = 0;
    acc = 0;
    stopAllRepeats();
    adjustSpeed();
    updateStats();
    elHiscore.textContent = String(hiscore);
    elFace.textContent = '🙂';
    elStartPause.textContent = '▶️ Start';
    drawHold();
    spawn();
    setOverlay('<div>Klaar voor start!</div><small>Druk op <span class="kbd">Spatie</span> of klik ▶️ Start</small>');
  }

  function onKeyDown(event) {
    if (PREVENT_DEFAULT_CODES.has(event.code)) {
      event.preventDefault();
    }

    if (gameOver) {
      if (event.code === 'Space' || event.key === 'Enter') {
        start();
      }
      return;
    }

    if (event.code === 'KeyP' || event.code === 'Escape') {
      if (running && !paused) pause(); else start();
      return;
    }

    if (event.code === 'KeyR') {
      reset();
      return;
    }

    if (!running && !paused && (event.code === 'Space' || event.key === 'Enter')) {
      start();
      return;
    }

    if (!running || paused) return;

    if (event.repeat && codeToRepeater.has(event.code)) {
      return;
    }

    const repeatName = codeToRepeater.get(event.code);
    if (repeatName) {
      beginRepeat(repeatName);
      return;
    }

    switch (event.code) {
      case 'ArrowUp':
      case 'KeyX':
      case 'KeyW':
        tryRotate(1);
        break;
      case 'KeyZ':
      case 'KeyQ':
        tryRotate(-1);
        break;
      case 'Space':
        hardDrop();
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
      case 'KeyC':
        holdPiece();
        break;
      default:
        break;
    }
  }

  function onKeyUp(event) {
    const name = codeToRepeater.get(event.code);
    if (name) endRepeat(name);
  }

  function init() {
    try {
      hiscore = Number(localStorage.getItem('tetris_hiscore') || '0') || 0;
    } catch (err) {
      hiscore = 0;
    }
    elHiscore.textContent = String(hiscore);
    reset();
  }

  // Event listeners
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  if (mkLeft) mkLeft.addEventListener('click', () => tryShift(-1));
  if (mkRight) mkRight.addEventListener('click', () => tryShift(1));
  if (mkRotL) mkRotL.addEventListener('click', () => tryRotate(-1));
  if (mkRotR) mkRotR.addEventListener('click', () => tryRotate(1));
  if (mkDown) mkDown.addEventListener('click', () => softDrop());
  if (mkHard) mkHard.addEventListener('click', () => hardDrop());

  elStartPause?.addEventListener('click', () => {
    if (gameOver) {
      start();
    } else if (!running || paused) {
      start();
    } else {
      pause();
    }
  });

  elReset?.addEventListener('click', () => reset());
  elFace?.addEventListener('click', () => {
    reset();
    start();
  });

  window.addEventListener('blur', () => {
    if (running && !paused) pause();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && running && !paused) pause();
  });

  const themeObserver = new MutationObserver(() => draw());
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  if (typeof darkScheme.addEventListener === 'function') {
    darkScheme.addEventListener('change', draw);
  } else if (typeof darkScheme.addListener === 'function') {
    darkScheme.addListener(draw);
  }

  let resizeRaf = null;
  function handleResize() {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = null;
      syncViewportMetrics();
      updateBoardSizing();
      draw();
      drawNext();
      drawHold();
    });
  }

  window.addEventListener('resize', handleResize);

  init();

  handleResize();
})();
