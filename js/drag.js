function setupDragAndDrop() {
  document.addEventListener("dragstart", (e) => {
    if (
      e.target.classList.contains("resume-block") ||
      e.target.classList.contains("contact-item")
    ) {
      e.target.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    }
  });

  document.addEventListener("dragend", (e) => {
    if (e.target.classList.contains("dragging")) {
      e.target.classList.remove("dragging");
      // Call debounceAutosave if available (defined in app.js)
      if (typeof debounceAutosave === "function") debounceAutosave();
    }
  });

  initSortables();
}

function initSortables() {
  const sortables = document.querySelectorAll(".sortable-list");
  sortables.forEach((container) => {
    if (container.dataset.sortInit) return;
    container.dataset.sortInit = "true";

    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const draggable = document.querySelector(".dragging");
      if (draggable && draggable.parentNode === container) {
        const afterElement = getDragAfterElement(container, e.clientY);
        if (afterElement == null) {
          container.appendChild(draggable);
        } else {
          if (afterElement.parentNode === container) {
            container.insertBefore(draggable, afterElement);
          }
        }
      }
    });
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.children].filter(
    (child) =>
      (child.classList.contains("resume-block") ||
        child.classList.contains("contact-item")) &&
      !child.classList.contains("dragging"),
  );

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      // Adjusted logic for zoomed canvas
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}

function moveBlock(btn, direction) {
  if (event) event.stopPropagation();

  const block = btn.closest(".resume-block") || btn.closest(".contact-item");
  if (!block) return;

  const parent = block.parentNode;
  if (direction === "up") {
    const prev = block.previousElementSibling;
    if (prev) {
      parent.insertBefore(block, prev);
      block.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      if (typeof debounceAutosave === "function") debounceAutosave();
    }
  } else {
    const next = block.nextElementSibling;
    if (next) {
      parent.insertBefore(next, block);
      block.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      if (typeof debounceAutosave === "function") debounceAutosave();
    }
  }
}
