const canvas = document.getElementById("game"); // 게임 캔버스를 가져옵니다.
const ctx = canvas.getContext("2d"); // 2D 그림을 그리는 도구를 가져옵니다.

// ===== 좌표와 크기 설정: 이 부분의 값을 바꾸면 화면 배치를 바꿀 수 있습니다. =====
// x는 왼쪽에서부터의 거리, y는 위쪽에서부터의 거리입니다. 단위는 픽셀입니다.
const screenWidth = 800; // 게임 화면의 가로 크기입니다.
const screenHeight = 600; // 게임 화면의 세로 크기입니다.
const laneCount = 6; // 레인 수입니다. 세로 구분선은 이보다 하나 적게 그립니다.
const laneWidth = screenWidth / laneCount; // 레인 하나의 너비를 자동으로 계산합니다.
const dividerWidth = 2; // 검은 세로 구분선의 두께입니다.

const judgmentX = 0; // 회색 판정 줄의 왼쪽 위치입니다.
const judgmentY = 500; // 회색 판정 줄의 위쪽 위치입니다.
const judgmentWidth = screenWidth; // 회색 판정 줄의 가로 크기입니다.
const judgmentHeight = 50; // 회색 판정 줄의 세로 크기입니다.

const playerWidth = 30; // 플레이어의 가로 크기입니다.
const playerHeight = 30; // 플레이어의 세로 크기입니다.
const playerX = laneWidth * 2.5 - playerWidth / 2; // 플레이어를 세 번째 레인의 가로 가운데에 놓습니다.
const playerY = judgmentY + (judgmentHeight - playerHeight) / 2; // 플레이어를 판정 줄 높이의 가운데에 놓습니다.

const noteWidth = laneWidth; // 초록 노트의 양옆이 레인의 검은 경계선에 닿도록 너비를 맞춥니다.
const noteHeight = 20; // 초록 노트의 높이를 줄여 납작하게 만듭니다.
const notes = [ // 노트 두 개의 위치 목록입니다.
  { x: laneWidth * 0.5 - noteWidth / 2, y: 60 }, // 첫 번째 레인의 위쪽에 노트를 놓습니다. y가 작을수록 높아집니다.
  { x: laneWidth * 2.5 - noteWidth / 2, y: (screenHeight - noteHeight) / 2 }, // 세 번째 레인의 가로·세로 가운데에 노트를 놓습니다.
];

// ===== 배경: 화면 전체를 흰색으로 채웁니다. =====
canvas.width = screenWidth; // 설정한 가로 크기를 캔버스에 적용합니다.
canvas.height = screenHeight; // 설정한 세로 크기를 캔버스에 적용합니다.
ctx.fillStyle = "white";
ctx.fillRect(0, 0, screenWidth, screenHeight);

// ===== 판정 줄: 화면 아래쪽에 긴 회색 줄을 그립니다. =====
ctx.fillStyle = "#aaa";
ctx.fillRect(judgmentX, judgmentY, judgmentWidth, judgmentHeight);

// ===== 레인 구분선: 위에서 아래까지 검은 세로선을 그립니다. =====
ctx.strokeStyle = "black";
ctx.lineWidth = dividerWidth;
for (let i = 1; i < laneCount; i++) {
  const x = laneWidth * i; // 레인 너비를 기준으로 각 구분선의 위치를 계산합니다.
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, screenHeight);
  ctx.stroke();
}

// ===== 노트: 각 레인의 너비에 맞춘 납작한 초록 사각형을 그립니다. =====
ctx.fillStyle = "green";
for (const note of notes) {
  ctx.fillRect(note.x, note.y, noteWidth, noteHeight);
}

// ===== 플레이어: 세 번째 레인의 회색 판정 줄 가운데에 파란 사각형을 그립니다. =====
ctx.fillStyle = "blue";
ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
