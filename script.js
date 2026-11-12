// ===== ① 준비 (canvas, ctx) =====
﻿const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ===== ② 상태 변수 =====
// ===== 화면과 고정된 물체의 위치, 크기 =====
const screenWidth = 800;
const screenHeight = 600;
const laneCount = 6;
const laneWidth = screenWidth / laneCount;
const dividerWidth = 2;

// ===== 적의 개수와 크기: 이 값을 바꾸면 한꺼번에 조절할 수 있습니다. =====
const enemyCount = 3;
const enemySize = 30;
const itemScore = 10; // 아이템 하나를 먹으면 얻는 점수입니다.
let score = 0;
const maxMisses = 20; // 이 개수만큼 노트를 놓치면 게임이 끝납니다.
let missedCount = 0;
let isGameOver = false;
let lastBiteTime = -Infinity;
let showDebug = true;
let showHitbox = showDebug;

// 게임이 끝났을 때만 보여 줄 재시작 버튼입니다.
const restartButton = document.createElement("button");
restartButton.id = "restart-button";
restartButton.textContent = "재시작";
restartButton.hidden = true;
canvas.insertAdjacentElement("afterend", restartButton);

const judgmentX = 0;
const judgmentY = 500;
const judgmentWidth = screenWidth;
const judgmentHeight = 50;

// ===== 플레이어의 위치, 크기, 이동 속도 =====
const playerWidth = 28;
const playerHeight = 30;
const playerSpeed = 8; // 매 프레임 이동할 거리(픽셀)입니다.
let playerX = laneWidth * 2.5 - playerWidth / 2;
let playerY = judgmentY + (judgmentHeight - playerHeight) / 2;

// 누르고 있는 키는 true, 뗀 키는 false로 기록합니다.
const keys = {};

// 각 적의 위치, 속도, 크기를 객체로 묶어서 배열에 담습니다.
const enemies = [];
// ===== ③ 이벤트 =====
restartButton.addEventListener("click", restartGame);

// 키를 누를 때마다 눌린 키 이름을 콘솔에 출력합니다.
// document.addEventListener("keydown", (event) => {
//   console.log(event.key);
// });

// 이벤트에서는 키 상태만 기록하고, 실제 이동은 게임 루프에서 계산합니다.
document.addEventListener("keydown", (event) => {
  if (event.code === "KeyD" && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey) {
    showDebug = !showDebug;
    showHitbox = showDebug;
  }
  preventGameKeyScroll(event);
  keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
  preventGameKeyScroll(event);
  keys[event.key] = false;
});

// 게임 화면의 왼쪽/오른쪽 절반을 클릭하면 해당 방향으로 한 칸 이동합니다.
canvas.addEventListener("click", (event) => {
  if (isGameOver) return;
  const bounds = canvas.getBoundingClientRect();
  const direction = event.clientX < bounds.left + bounds.width / 2 ? -1 : 1;
  playerX += direction * laneWidth;

  // 플레이어의 크기를 고려하여 화면 양옆을 벗어나지 않게 막습니다.
  playerX = Math.max(0, Math.min(playerX, canvas.width - playerWidth));
});

// 창을 벗어났을 때 키가 계속 눌린 상태로 남지 않게 초기화합니다.
window.addEventListener("blur", () => {
  for (const key in keys) {
    keys[key] = false;
  }
});

// ===== ④ 함수들 =====
// 방향키와 스페이스바의 기본 동작인 페이지 스크롤을 막습니다.
function preventGameKeyScroll(event) {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
    event.preventDefault();
  }
}

function resetNotes() {
  enemies.length = 0;
  for (let i = 0; i < enemyCount; i++) {
    enemies.push({
      x: Math.floor((i * laneCount) / enemyCount) * laneWidth,
      y: -enemySize,
      speed: 2 + i, // 처음에는 각각 2, 3, 4의 속도로 떨어집니다.
      size: enemySize,
    });
  }
}

// 점수, 입력 상태, 플레이어와 노트를 모두 처음 상태로 되돌립니다.
function restartGame() {
  lastBiteTime = -Infinity;
  score = 0;
  missedCount = 0;
  isGameOver = false;
  playerX = laneWidth * 2.5 - playerWidth / 2;
  playerY = judgmentY + (judgmentHeight - playerHeight) / 2;
  for (const key in keys) keys[key] = false;
  resetNotes();
  restartButton.hidden = true;
}


function updateGame() {
  // ===== 2. 계산: 플레이어와 적의 위치를 바꿉니다. =====
  // 각 방향을 따로 확인하므로 두 키를 함께 누르면 대각선으로 이동합니다.
  if (keys.ArrowLeft) playerX -= playerSpeed;
  if (keys.ArrowRight) playerX += playerSpeed;
  //if (keys.ArrowUp) playerY -= playerSpeed;
  //if (keys.ArrowDown) playerY += playerSpeed;

  // 플레이어 크기를 고려하여 네 벽 밖으로 나가지 않게 막습니다.
  playerX = Math.max(0, Math.min(playerX, canvas.width - playerWidth));
  playerY = Math.max(0, Math.min(playerY, canvas.height - playerHeight));

  // 뒤에서부터 확인하면 아이템을 제거해도 다른 아이템을 건너뛰지 않습니다.
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.y += enemy.speed; // y가 커질수록 화면 아래로 움직입니다.

    // 초록색 물체를 아이템으로 사용하며, 실제 그리는 가로 폭으로 접촉을 확인합니다.
    const isTouching =
      playerX <= enemy.x + laneWidth &&
      playerX + playerWidth >= enemy.x &&
      playerY <= enemy.y + enemy.size &&
      playerY + playerHeight >= enemy.y;

    if (isTouching) {
      score += itemScore;
      lastBiteTime = performance.now();
      enemies.splice(i, 1); // 닿은 아이템 객체를 배열에서 제거합니다.
      // 같은 속도와 크기의 새 아이템을 화면 위쪽의 랜덤한 칸에 만듭니다.
      enemies.push({
        x: Math.floor(Math.random() * laneCount) * laneWidth,
        y: -enemy.size,
        speed: enemy.speed,
        size: enemy.size,
      });
      continue;
    }

    // 적 전체가 화면 아래로 사라지면 위쪽의 랜덤한 칸에서 다시 떨어집니다.
    if (enemy.y >= canvas.height) {
      missedCount += 1;
      if (missedCount >= maxMisses) {
        isGameOver = true;
        restartButton.hidden = false;
        return; // 게임이 끝난 프레임부터 나머지 이동과 판정을 멈춥니다.
      }
      enemy.x = Math.floor(Math.random() * laneCount) * laneWidth;
      enemy.y = -enemy.size;
    }
  }
}

function drawDebug() {
  // 매 프레임 연결하므로 코드에서 showDebug를 바꿔도 함께 적용됩니다.
  showHitbox = showDebug;
  if (!showDebug) return;

  ctx.save();
  if (showHitbox) {
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = "#e11d48";
    ctx.strokeRect(playerX, playerY, playerWidth, playerHeight);
    ctx.strokeStyle = "#f97316";
    for (const enemy of enemies) {
      ctx.strokeRect(enemy.x, enemy.y, laneWidth, enemy.size);
    }
    ctx.setLineDash([]);
  }

  // 점수판 아래에 표시하고, 게임 오버 화면에서도 읽을 수 있게 합니다.
  const gameState = isGameOver ? "gameOver" : "playing";
  const lines = [
    "DEBUG [D: 켜기/끄기]",
    `플레이어 x: ${playerX.toFixed(1)}, y: ${playerY.toFixed(1)}`,
    `노트 개수: ${enemies.length}`,
    `gameState: ${gameState}`,
    `점수: ${score}`,
  ];
  ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
  ctx.fillRect(10, 78, 270, 108);
  ctx.font = "13px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#e2e8f0";
  lines.forEach((line, index) => ctx.fillText(line, 20, 88 + index * 18));
  ctx.restore();
}

// ===== ⑤ 게임 루프 =====
function gameLoop() {
  // 게임 오버 상태에서는 위치와 점수를 갱신하지 않습니다.
  if (!isGameOver) updateGame();

  // 이전 프레임의 그림을 지웁니다.
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ===== 3. 그리기: 배경과 물체를 새 위치에 다시 그립니다. =====
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 화면 아래쪽의 회색 판정 줄을 그립니다.
  ctx.fillStyle = "#aaa";
  ctx.fillRect(judgmentX, judgmentY, judgmentWidth, judgmentHeight);

  // 여섯 레인을 나누는 검은 세로선을 그립니다.
  ctx.strokeStyle = "black";
  ctx.lineWidth = dividerWidth;
  for (let i = 1; i < laneCount; i++) {
    const x = laneWidth * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // 적의 가로는 한 칸 전체를 채우고, 세로는 각 객체의 크기로 그립니다.
  ctx.fillStyle = "green";
  for (const enemy of enemies) {
    ctx.fillRect(enemy.x, enemy.y, laneWidth, enemy.size);
  }

  // 위쪽이 살짝 파인 동그란 캐릭터를 그립니다.
  ctx.save();
  ctx.translate(playerX, playerY);
  ctx.scale(playerWidth / 28, playerHeight / 30);

  // 가까운 노트를 향해 입을 벌리고, 먹은 뒤에는 두 번 오물거립니다.
  const biteAge = performance.now() - lastBiteTime;
  const biteProgress = Math.min(biteAge / 420, 1);
  const chewing = biteAge < 420
    ? Math.sin(biteProgress * Math.PI * 2) ** 2
    : 0;
  let anticipation = 0;
  if (!isGameOver) {
    for (const enemy of enemies) {
      const gap = playerY - (enemy.y + enemy.size);
      if (playerX < enemy.x + laneWidth && playerX + playerWidth > enemy.x && gap >= 0 && gap < 75) {
        anticipation = Math.max(anticipation, 1 - gap / 75);
      }
    }
  }
  const mouthOpen = Math.max(anticipation, chewing);
  const mouthLeft = 9 - mouthOpen * 3;
  const mouthRight = 19 + mouthOpen * 3;
  const mouthDepth = 8 + mouthOpen * 8;

  // 몸체의 윤곽을 직접 그려서 홈 안으로 배경이 보이게 합니다.
  const bodyColor = ctx.createLinearGradient(0, 0, 0, 30);
  bodyColor.addColorStop(0, "#8ceaff");
  bodyColor.addColorStop(0.5, "#38bdf8");
  bodyColor.addColorStop(1, "#2563eb");
  ctx.beginPath();
  ctx.moveTo(mouthLeft, 2);
  ctx.bezierCurveTo(mouthLeft + 1, mouthDepth, mouthRight - 1, mouthDepth, mouthRight, 2);
  ctx.bezierCurveTo(24, 3, 27, 9, 27, 16);
  ctx.bezierCurveTo(27, 24, 22, 29, 14, 29);
  ctx.bezierCurveTo(6, 29, 1, 24, 1, 16);
  ctx.bezierCurveTo(1, 9, 4, 3, mouthLeft, 2);
  ctx.closePath();
  ctx.fillStyle = bodyColor;
  ctx.fill();
  ctx.strokeStyle = "#164e8a";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 반짝이는 하이라이트와 볼, 눈, 웃는 입을 더합니다.
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.beginPath();
  ctx.ellipse(6, 10, 1.5, 3, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f9a8d4";
  for (const x of [6, 22]) {
    ctx.beginPath();
    ctx.ellipse(x, 20, 2.5, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#102e56";
  for (const x of [9, 19]) {
    ctx.beginPath();
    ctx.ellipse(x, 15, 1.6, 2.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x + 0.4, 14.2, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#102e56";
  }
  ctx.beginPath();
  ctx.arc(14, 19, 3, 0.15, Math.PI - 0.15);
  ctx.strokeStyle = "#102e56";
  ctx.lineWidth = 1.3;
  ctx.lineCap = "round";
  ctx.stroke();
  // 작아진 노트가 위쪽 입으로 빨려 들어가는 효과입니다.
  if (biteAge < 180) {
    const swallow = biteAge / 180;
    ctx.save();
    ctx.globalAlpha = 1 - swallow;
    ctx.fillStyle = "#4ade80";
    const morselWidth = 14 * (1 - swallow);
    ctx.fillRect(14 - morselWidth / 2, -9 + swallow * 16, morselWidth, 5 * (1 - swallow));
    ctx.restore();
  }
  if (biteAge < 420) {
    ctx.save();
    ctx.globalAlpha = 1 - biteProgress;
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 1.8;
    for (let i = 0; i < 5; i++) {
      const angle = Math.PI + (i / 4) * Math.PI;
      const distance = 12 + biteProgress * 17;
      const x = 14 + Math.cos(angle) * distance;
      const y = 2 + Math.sin(angle) * distance;
      ctx.beginPath();
      ctx.moveTo(x - 2, y);
      ctx.lineTo(x + 2, y);
      ctx.moveTo(x, y - 2);
      ctx.lineTo(x, y + 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();

  // 다른 물체 위에 점수를 그려서 왼쪽 위에서 확인할 수 있게 합니다.
  ctx.fillStyle = "black";
  ctx.font = "24px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`점수: ${score}`, 10, 10);
  ctx.fillText(`놓친 노트: ${missedCount} / ${maxMisses}`, 10, 42);

  if (isGameOver) {
    // 멈춘 게임 화면 위에 게임 오버 안내를 표시합니다.
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("게임 오버", canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = "24px sans-serif";
    ctx.fillText(`최종 점수: ${score}`, canvas.width / 2, canvas.height / 2 + 25);
  }

  drawDebug();

  // 다음 화면 갱신 시점에 이 함수를 다시 실행하도록 예약합니다.
  requestAnimationFrame(gameLoop);
}

// ===== ⑥ 시동 =====
canvas.width = screenWidth;
canvas.height = screenHeight;
resetNotes();

// 첫 프레임을 예약해서 게임 루프를 시작합니다.
requestAnimationFrame(gameLoop);
