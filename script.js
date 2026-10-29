const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ===== 화면과 고정된 물체의 위치, 크기 =====
const screenWidth = 800;
const screenHeight = 600;
const laneCount = 6;
const laneWidth = screenWidth / laneCount;
const dividerWidth = 2;

const judgmentX = 0;
const judgmentY = 500;
const judgmentWidth = screenWidth;
const judgmentHeight = 50;

// ===== 플레이어의 위치, 크기, 이동 속도 =====
const playerWidth = 30;
const playerHeight = 30;
const playerSpeed = 8; // 매 프레임 이동할 거리(픽셀)입니다.
let playerX = laneWidth * 2.5 - playerWidth / 2;
let playerY = judgmentY + (judgmentHeight - playerHeight) / 2;

// 누르고 있는 키는 true, 뗀 키는 false로 기록합니다.
const keys = {};

// ===== 노트의 위치, 크기, 속도 =====
const noteWidth = laneWidth;
const noteHeight = 20;
const notes = [
  { x: 0, y: 60, speedY: 2 }, // 첫 번째 레인에서 아래로 떨어지는 노트입니다.
  { x: laneWidth * 2, y: (screenHeight - noteHeight) / 2, speedY: 3 },
]; // 각 노트의 speedY를 바꾸면 떨어지는 속도가 달라집니다.

canvas.width = screenWidth;
canvas.height = screenHeight;

function gameLoop() {
  // ===== 1. 지우기: 이전 프레임의 그림을 지웁니다. =====
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ===== 2. 계산: 플레이어와 노트의 위치를 바꿉니다. =====
  // 각 방향을 따로 확인하므로 두 키를 함께 누르면 대각선으로 이동합니다.
  if (keys.ArrowLeft) playerX -= playerSpeed;
  if (keys.ArrowRight) playerX += playerSpeed;
  //if (keys.ArrowUp) playerY -= playerSpeed;
  //if (keys.ArrowDown) playerY += playerSpeed;

  // 플레이어 크기를 고려하여 네 벽 밖으로 나가지 않게 막습니다.
  playerX = Math.max(0, Math.min(playerX, canvas.width - playerWidth));
  playerY = Math.max(0, Math.min(playerY, canvas.height - playerHeight));

  for (const note of notes) {
    note.y += note.speedY; // y가 커질수록 화면 아래로 움직입니다.

    // 노트 전체가 화면 아래로 사라지면 화면 위에서 다시 떨어집니다.
    if (note.y >= canvas.height) {
      note.y = -noteHeight;
    }
  }

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

  // 초록 노트 두 개를 그립니다.
  ctx.fillStyle = "green";
  for (const note of notes) {
    ctx.fillRect(note.x, note.y, noteWidth, noteHeight);
  }

  // 방향키와 마우스로 움직이는 파란 플레이어를 그립니다.
  ctx.fillStyle = "blue";
  ctx.fillRect(playerX, playerY, playerWidth, playerHeight);

  // 다음 화면 갱신 시점에 이 함수를 다시 실행하도록 예약합니다.
  requestAnimationFrame(gameLoop);
}

// 첫 프레임을 예약해서 게임 루프를 시작합니다.
requestAnimationFrame(gameLoop);

// 키를 누를 때마다 눌린 키 이름을 콘솔에 출력합니다.
// document.addEventListener("keydown", (event) => {
//   console.log(event.key);
// });

// 방향키와 스페이스바의 기본 동작인 페이지 스크롤을 막습니다.
function preventGameKeyScroll(event) {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
    event.preventDefault();
  }
}

// 이벤트에서는 키 상태만 기록하고, 실제 이동은 게임 루프에서 계산합니다.
document.addEventListener("keydown", (event) => {
  preventGameKeyScroll(event);
  keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
  preventGameKeyScroll(event);
  keys[event.key] = false;
});

// 게임 화면의 왼쪽/오른쪽 절반을 클릭하면 해당 방향으로 한 칸 이동합니다.
canvas.addEventListener("click", (event) => {
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
