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

// ===== 플레이어의 위치, 크기, 속도 =====
const playerWidth = 30;
const playerHeight = 30;
let playerX = laneWidth * 2.5 - playerWidth / 2;
const playerY = judgmentY + (judgmentHeight - playerHeight) / 2;
let playerSpeedX = 3; // 프레임마다 이동할 거리입니다. 양수는 오른쪽, 음수는 왼쪽입니다.

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
  playerX += playerSpeedX;

  // 플레이어가 좌우 끝에 닿으면 화면 안에 맞추고 방향을 뒤집습니다.
  if (playerX + playerWidth >= canvas.width) {
    playerX = canvas.width - playerWidth;
    playerSpeedX = -Math.abs(playerSpeedX);
  } else if (playerX <= 0) {
    playerX = 0;
    playerSpeedX = Math.abs(playerSpeedX);
  }

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

  // 회색 판정 줄 위에서 좌우로 움직이는 파란 플레이어를 그립니다.
  ctx.fillStyle = "blue";
  ctx.fillRect(playerX, playerY, playerWidth, playerHeight);

  // 다음 화면 갱신 시점에 이 함수를 다시 실행하도록 예약합니다.
  requestAnimationFrame(gameLoop);
}

// 첫 프레임을 예약해서 게임 루프를 시작합니다.
requestAnimationFrame(gameLoop);
