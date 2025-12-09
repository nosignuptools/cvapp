let panState = {
  scale: 1,
  panning: false,
  pointX: 0,
  pointY: 0,
  startX: 0,
  startY: 0,
};

function setupPanZoom() {
  const container = document.getElementById("mainCanvas");
  const paperContainer = document.getElementById("paper-container");

  // Initial alignment
  resetZoom();

  // Mouse Down (Start Pan)
  container.addEventListener("mousedown", (e) => {
    if (
      e.target.closest(".resume-block") ||
      e.target.closest(".contact-item") ||
      e.target.isContentEditable ||
      e.target.tagName === "INPUT" ||
      e.target.closest("button") ||
      e.target.closest(".block-controls")
    ) {
      return;
    }

    panState.panning = true;
    panState.startX = e.clientX - panState.pointX;
    panState.startY = e.clientY - panState.pointY;
    container.style.cursor = "grabbing";
  });

  // Mouse Move (Panning)
  window.addEventListener("mousemove", (e) => {
    if (!panState.panning) return;
    e.preventDefault();
    panState.pointX = e.clientX - panState.startX;
    panState.pointY = e.clientY - panState.startY;
    updateTransform();
  });

  // Mouse Up (End Pan)
  window.addEventListener("mouseup", () => {
    panState.panning = false;
    container.style.cursor = "grab";
  });

  // Wheel Zoom (Direct Zoom)
  container.addEventListener(
    "wheel",
    (e) => {
      if (!e.target.closest(".sidebar-panel")) {
        e.preventDefault();

        const xs = (e.clientX - panState.pointX) / panState.scale;
        const ys = (e.clientY - panState.pointY) / panState.scale;

        const delta = -Math.sign(e.deltaY) * 0.1;
        panState.scale = Math.min(Math.max(0.3, panState.scale + delta), 3);

        panState.pointX = e.clientX - xs * panState.scale;
        panState.pointY = e.clientY - ys * panState.scale;
        updateTransform();
      }
    },
    { passive: false },
  );

  // --- MOBILE TOUCH LOGIC ---
  let initialPinchDistance = null;

  container.addEventListener(
    "touchstart",
    (e) => {
      if (
        e.target.closest(".resume-block") ||
        e.target.closest(".contact-item") ||
        e.target.isContentEditable ||
        e.target.closest(".block-controls")
      )
        return;

      if (e.touches.length === 1) {
        panState.panning = true;
        panState.startX = e.touches[0].clientX - panState.pointX;
        panState.startY = e.touches[0].clientY - panState.pointY;
      } else if (e.touches.length === 2) {
        panState.panning = false;
        initialPinchDistance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY,
        );
      }
    },
    { passive: false },
  );

  container.addEventListener(
    "touchmove",
    (e) => {
      if (e.target.isContentEditable) return;

      if (e.touches.length === 1 && panState.panning) {
        e.preventDefault();
        panState.pointX = e.touches[0].clientX - panState.startX;
        panState.pointY = e.touches[0].clientY - panState.startY;
        updateTransform();
      } else if (e.touches.length === 2 && initialPinchDistance) {
        e.preventDefault();
        const currentDist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY,
        );

        const diff = currentDist - initialPinchDistance;
        const zoomFactor = diff * 0.005;
        panState.scale = Math.min(
          Math.max(0.3, panState.scale + zoomFactor),
          3,
        );

        initialPinchDistance = currentDist;
        updateTransform();
      }
    },
    { passive: false },
  );

  container.addEventListener("touchend", () => {
    panState.panning = false;
    initialPinchDistance = null;
  });
}

function updateTransform() {
  const paper = document.getElementById("paper-container");
  paper.style.transform = `translate(${panState.pointX}px, ${panState.pointY}px) scale(${panState.scale})`;
}

function zoomCanvas(amount) {
  panState.scale = Math.min(Math.max(0.3, panState.scale + amount), 3);
  updateTransform();
}

function resetZoom() {
  // A4 width in px (approx)
  const paperWidth = 794;
  const screenWidth = window.innerWidth;

  // Mobile vs Desktop Scale
  panState.scale = screenWidth < 900 ? (screenWidth / paperWidth) * 0.9 : 0.8;

  // Exact Horizontal Center
  panState.pointX = (screenWidth - paperWidth * panState.scale) / 2;

  // Align Top with small margin
  panState.pointY = 40;

  updateTransform();
}
