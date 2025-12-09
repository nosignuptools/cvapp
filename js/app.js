let autosaveTimeout;
let currentTemplate = "modern";
let activeContacts = {};
const STORAGE_KEY = "cv-creator-v3";

document.addEventListener("DOMContentLoaded", function () {
  loadFromLocalStorage();
  setupAutosave();
  updateTemplateCards();
  syncContactToggles();
  setupDragAndDrop();
  setupPanZoom();
  setupSelectionLogic();
  sanitizeContactAnchors();

  const menuBtn = document.getElementById("mobileMenuBtn");
  if (menuBtn) {
    menuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleSidebar();
    });
  }
});

// --- CORE LOGIC ---

function setupSelectionLogic() {
  document.addEventListener("click", (e) => {
    if (e.target.closest(".block-controls")) return;
    const block = e.target.closest(".resume-block");
    document.querySelectorAll(".resume-block.selected").forEach((b) => {
      if (b !== block) b.classList.remove("selected");
    });
    if (block) block.classList.add("selected");
  });
}

function toggleCollapse(header) {
  header.closest(".collapse-section").classList.toggle("open");
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebarPanel");
  const menuBtn = document.getElementById("mobileMenuBtn");
  sidebar.classList.toggle("open");
  menuBtn.innerHTML = sidebar.classList.contains("open")
    ? '<i class="fa-solid fa-times"></i>'
    : '<i class="fa-solid fa-bars"></i>';
}

document.addEventListener("click", function (e) {
  const sidebar = document.getElementById("sidebarPanel");
  const menuBtn = document.getElementById("mobileMenuBtn");
  if (
    window.innerWidth <= 900 &&
    sidebar.classList.contains("open") &&
    !sidebar.contains(e.target) &&
    !menuBtn.contains(e.target)
  ) {
    toggleSidebar();
  }
});

// --- AUTOSAVE & LOAD ---

function setupAutosave() {
  const paper = document.getElementById("resume-paper");
  paper.addEventListener("input", debounceAutosave);
  paper.addEventListener("input", stripContactAnchors);
  document.addEventListener("paste", (e) => {
    setTimeout(() => stripContactAnchors(), 0);
  });
  setInterval(autoSave, 30000);
  window.addEventListener("beforeunload", autoSave);
}

function debounceAutosave() {
  clearTimeout(autosaveTimeout);
  autosaveTimeout = setTimeout(autoSave, 2000);
}

function autoSave() {
  const paper = document.getElementById("resume-paper");
  const data = {
    html: paper.innerHTML,
    template: currentTemplate,
    contacts: activeContacts,
    bg: paper.style.getPropertyValue("--bg-color") || "#1e3a5f",
    accent: paper.style.getPropertyValue("--accent-color") || "#3b82f6",
    font:
      paper.style.getPropertyValue("--font-family") || "'Inter', sans-serif",
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  const indicator = document.getElementById("autosaveIndicator");
  if (indicator) {
    indicator.classList.add("show");
    setTimeout(() => indicator.classList.remove("show"), 2000);
  }
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      const paper = document.getElementById("resume-paper");
      let cleanHtml = data.html;
      cleanHtml = cleanHtml.replace(
        /<a([^>]*)class="contact-link"([^>]*)>(.*?)<\/a>/gi,
        '<div class="contact-link">$3</div>',
      );
      if (cleanHtml) paper.innerHTML = cleanHtml;

      if (data.template) {
        // Fallback if the saved template was removed (creative)
        if (data.template === "creative") {
          currentTemplate = "modern";
          paper.className = "template-modern";
        } else {
          currentTemplate = data.template;
          paper.className = "template-" + data.template;
        }
      }
      if (data.contacts) activeContacts = data.contacts;
      if (data.bg) {
        paper.style.setProperty("--bg-color", data.bg);
        document.getElementById("bgColorPicker").value = data.bg;
      }
      if (data.accent) {
        paper.style.setProperty("--accent-color", data.accent);
        document.getElementById("accentColorPicker").value = data.accent;
      }
      if (data.font) {
        paper.style.setProperty("--font-family", data.font);
        document.getElementById("fontSelector").value = data.font;
      }
      updateTemplateCards();
      initSortables();
    } catch (e) {
      console.log("Load error:", e);
    }
  }
}

// --- CONTACTS ---

function sanitizeContactAnchors() {
  const paper = document.getElementById("resume-paper");
  if (!paper) return;
  paper.querySelectorAll("a.contact-link").forEach((a) => {
    const div = document.createElement("div");
    div.className = a.className || "contact-link";
    div.innerHTML = a.innerHTML;
    a.replaceWith(div);
  });
  paper.querySelectorAll(".contact-item a").forEach((a) => {
    const parent = a.closest(".contact-item");
    if (!parent) return;
    const div = document.createElement("div");
    div.className = a.className || "contact-link";
    div.innerHTML = a.innerHTML;
    a.replaceWith(div);
  });
}

function stripContactAnchors() {
  const paper = document.getElementById("resume-paper");
  if (!paper) return;
  paper.querySelectorAll("a.contact-link").forEach((a) => {
    const div = document.createElement("div");
    div.className = a.className || "contact-link";
    div.innerHTML = a.innerHTML;
    a.replaceWith(div);
  });
  paper.querySelectorAll(".contact-item a").forEach((a) => {
    const contact = a.closest(".contact-item");
    if (!contact) return;
    let linkWrapper = a.closest(".contact-link");
    if (!linkWrapper) {
      linkWrapper = document.createElement("div");
      linkWrapper.className = "contact-link";
      const icon = contact.querySelector("i");
      if (icon) linkWrapper.appendChild(icon.cloneNode(true));
    }
    const span = document.createElement("span");
    span.contentEditable = true;
    span.innerHTML = a.innerHTML || a.textContent || "";
    linkWrapper.appendChild(span);
    a.replaceWith(linkWrapper);
  });
}

function syncContactToggles() {
  document.querySelectorAll(".toggle-item").forEach((item) => {
    const type = item.dataset.type;
    const exists = document.querySelector(
      `#area-sidebar .contact-item[data-contact="${type}"]`,
    );
    if (exists) {
      item.classList.add("active");
      activeContacts[type] = true;
    } else {
      item.classList.remove("active");
      activeContacts[type] = false;
    }
  });
}

function ensureContactSection() {
  const sidebar = document.getElementById("area-sidebar");
  let contactSection = sidebar.querySelector(".contact-section");
  if (!contactSection) {
    clearPlaceholder("area-sidebar");
    const html = `
        <div class="resume-block contact-section" draggable="true" style="padding: 4px; margin-bottom: 16px;">
            ${controlsHtml}
            <h3 class="sidebar-section-header" contenteditable="true" spellcheck="false">Contact</h3>
            <div class="contact-items sortable-list"></div>
        </div>`;
    sidebar.insertAdjacentHTML("beforeend", html);
    contactSection = sidebar.querySelector(".contact-section");
    initSortables();
  }
  return contactSection.querySelector(".contact-items");
}

function checkContactSectionEmpty() {
  const contactSection = document.querySelector(
    "#area-sidebar .contact-section",
  );
  if (contactSection) {
    const items = contactSection.querySelectorAll(".contact-item");
    if (items.length === 0) {
      contactSection.remove();
    }
  }
}

function toggleContact(type) {
  const toggle = document.querySelector(`.toggle-item[data-type="${type}"]`);
  const isActive = toggle.classList.contains("active");

  if (isActive) {
    const existing = document.querySelector(
      `#area-sidebar .contact-item[data-contact="${type}"]`,
    );
    if (existing) existing.remove();
    toggle.classList.remove("active");
    activeContacts[type] = false;
    checkContactSectionEmpty();
  } else {
    const contactContainer = ensureContactSection();
    const info = contactIcons[type];
    const html = `
        <div class="contact-item" draggable="true" data-contact="${type}">
            <div class="contact-link">
                <i class="${info.icon}"></i>
                <span contenteditable="true" placeholder="${info.placeholder}"></span>
            </div>
        </div>`;
    contactContainer.insertAdjacentHTML("beforeend", html);
    toggle.classList.add("active");
    activeContacts[type] = true;
  }
  debounceAutosave();
}

// --- TEMPLATES & STYLING ---

function setTemplate(template) {
  currentTemplate = template;
  document.getElementById("resume-paper").className = "template-" + template;
  updateTemplateCards();
  debounceAutosave();
}

function updateTemplateCards() {
  document
    .querySelectorAll(".template-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.getElementById("tpl-" + currentTemplate)?.classList.add("active");
}

function updateColor(type, value) {
  const paper = document.getElementById("resume-paper");
  paper.style.setProperty(
    type === "bg" ? "--bg-color" : "--accent-color",
    value,
  );
  debounceAutosave();
}

function updateFont(font) {
  const paper = document.getElementById("resume-paper");
  paper.style.setProperty("--font-family", font);
  paper.style.fontFamily = font;
  debounceAutosave();
}

function applyPreset(bg, accent) {
  document.getElementById("bgColorPicker").value = bg;
  document.getElementById("accentColorPicker").value = accent;
  updateColor("bg", bg);
  updateColor("accent", accent);
}

// --- BLOCK MANAGEMENT ---

function clearPlaceholder(containerId) {
  const container = document.getElementById(containerId);
  const placeholder = container.querySelector(
    "p.text-white\\/40, p.text-gray-400",
  );
  if (placeholder) placeholder.remove();
}

function removeBlock(btn) {
  if (event) event.stopPropagation();
  const block = btn.closest(".resume-block");
  if (block) {
    block.style.opacity = "0";
    block.style.transform = "scale(0.95)";
    setTimeout(() => {
      block.remove();
      debounceAutosave();
    }, 150);
  }
}

function addBlock(type) {
  const sidebarTypes = [
    "photo",
    "name",
    "title",
    "skills",
    "languages",
    "interests",
    "awards",
  ];
  const containerId = sidebarTypes.includes(type)
    ? "area-sidebar"
    : "area-body";
  clearPlaceholder(containerId);
  document
    .getElementById(containerId)
    .insertAdjacentHTML("beforeend", sectionTemplates[type]);
  initSortables();
  debounceAutosave();
  if (window.innerWidth <= 900) toggleSidebar();
}

function addJobItem(btn) {
  const container = btn
    .closest(".resume-block")
    .querySelector(".jobs-container");
  const html = `
    <div class="job-item resume-block" style="margin: 0 -6px 12px; padding: 6px;">
        ${controlsHtml}
        <div class="flex justify-between items-start mb-1 flex-wrap gap-1">
            <h4 class="font-semibold text-gray-800 text-sm" contenteditable="true" placeholder="Job Title"></h4>
            <span class="text-[10px] text-gray-500 font-medium" contenteditable="true" placeholder="Date - Date"></span>
        </div>
        <div class="text-xs text-accent font-medium mb-2" contenteditable="true" placeholder="Company Name"></div>
        <ul class="list-disc list-outside ml-4 text-xs text-gray-600 space-y-1" contenteditable="true">
            <li placeholder="Responsibilities..."></li>
        </ul>
    </div>`;
  container.insertAdjacentHTML("beforeend", html);
  debounceAutosave();
}

function addEduItem(btn) {
  const container = btn
    .closest(".resume-block")
    .querySelector(".edu-container");
  const html = `
    <div class="edu-item resume-block" style="margin: 0 -6px 12px; padding: 6px;">
        ${controlsHtml}
        <div class="flex justify-between items-start mb-1 flex-wrap gap-1">
            <h4 class="font-semibold text-gray-800 text-sm" contenteditable="true" placeholder="Degree"></h4>
            <span class="text-[10px] text-gray-500 font-medium" contenteditable="true" placeholder="Year"></span>
        </div>
        <div class="flex justify-between items-start mb-1">
            <div class="text-xs text-gray-600" contenteditable="true" placeholder="School Name"></div>
            <div class="text-[10px] text-gray-500 font-medium" contenteditable="true" placeholder="City, Country"></div>
        </div>
        <ul class="list-disc list-outside ml-4 text-xs text-gray-500 space-y-1" contenteditable="true">
            <li placeholder="GPA / Honors / Notes (optional)"></li>
        </ul>
    </div>`;
  container.insertAdjacentHTML("beforeend", html);
  debounceAutosave();
}

function addProjectItem(btn) {
  const container = btn
    .closest(".resume-block")
    .querySelector(".projects-container");
  const html = `
    <div class="project-item resume-block" style="margin: 0 -6px 12px; padding: 6px;">
        ${controlsHtml}
        <h4 class="font-semibold text-gray-800 text-sm" contenteditable="true" placeholder="Project Name"></h4>
        <p class="text-xs text-gray-600" contenteditable="true" placeholder="Project description..."></p>
    </div>`;
  container.insertAdjacentHTML("beforeend", html);
  debounceAutosave();
}

// --- UTILITIES ---

function loadPhoto(event) {
  const input = event.target;
  const img = input.closest(".resume-block").querySelector("img");
  const file = input.files[0];
  if (file && img) {
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
      debounceAutosave();
    };
    reader.readAsDataURL(file);
  }
}

document.addEventListener("paste", function (e) {
  const target = e.target;
  const list = target.closest("ul, ol");
  if (list && list.isContentEditable) {
    e.preventDefault();
    let text = (e.clipboardData || window.clipboardData).getData("text");
    text = text.replace(/^[\s\t]*[•\-*·][\s\t]*/gm, "");
    const items = text.split(/\r?\n/).filter((line) => line.trim() !== "");
    let html = items.map((item) => `<li>${item.trim()}</li>`).join("");
    document.execCommand("insertHTML", false, html);
  }
});

// --- SAVE, LOAD & RESET ---

function showResetModal() {
  document.getElementById("resetModal").classList.add("show");
}
function hideResetModal() {
  document.getElementById("resetModal").classList.remove("show");
}

function resetCV() {
  localStorage.removeItem(STORAGE_KEY);
  const paper = document.getElementById("resume-paper");
  paper.innerHTML = DEFAULT_HTML;
  paper.className = "template-modern";
  paper.style.setProperty("--bg-color", "#1e3a5f");
  paper.style.setProperty("--accent-color", "#3b82f6");
  paper.style.setProperty("--font-family", "'Inter', sans-serif");
  paper.style.fontFamily = "'Inter', sans-serif";
  document.getElementById("bgColorPicker").value = "#1e3a5f";
  document.getElementById("accentColorPicker").value = "#3b82f6";
  document.getElementById("fontSelector").value = "'Inter', sans-serif";
  currentTemplate = "modern";
  activeContacts = {};
  updateTemplateCards();
  document
    .querySelectorAll(".toggle-item")
    .forEach((t) => t.classList.remove("active"));
  initSortables();
  hideResetModal();
  if (typeof resetZoom === "function") resetZoom();
}

function handlePrint() {
  const btn = document.getElementById("downloadBtn");
  const originalContent = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparing...';

  // Safety fix for email links in print
  const modified = [];
  document
    .querySelectorAll('#resume-paper .contact-item[data-contact="email"] span')
    .forEach((span) => {
      const orig = span.innerText || "";
      if (orig && orig.includes("@")) {
        span.setAttribute("data-orig-text", orig);
        const safe = orig.replace("@", "@\u200B");
        span.innerText = safe;
        modified.push(span);
      }
    });

  const restore = () => {
    modified.forEach((span) => {
      const orig = span.getAttribute("data-orig-text");
      if (orig !== null) {
        span.innerText = orig;
        span.removeAttribute("data-orig-text");
      }
    });
    btn.innerHTML = originalContent;
    window.removeEventListener("afterprint", restore);
  };

  window.addEventListener("afterprint", restore);

  setTimeout(() => {
    window.print();
    setTimeout(restore, 1000);
  }, 200);
}

function saveProject() {
  const paper = document.getElementById("resume-paper");
  const data = {
    html: paper.innerHTML,
    template: currentTemplate,
    contacts: activeContacts,
    bg: paper.style.getPropertyValue("--bg-color") || "#1e3a5f",
    accent: paper.style.getPropertyValue("--accent-color") || "#3b82f6",
    font:
      paper.style.getPropertyValue("--font-family") || "'Inter', sans-serif",
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cv-project.json";
  a.click();
  URL.revokeObjectURL(url);
  if (window.innerWidth <= 900) toggleSidebar();
}

function loadProject(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      const paper = document.getElementById("resume-paper");

      let html = data.html;
      html = html.replace(
        /<a([^>]*)class="contact-link"([^>]*)>(.*?)<\/a>/gi,
        '<div class="contact-link">$3</div>',
      );

      paper.innerHTML = html;

      if (data.template) {
        currentTemplate = data.template;
        paper.className = "template-" + data.template;
        updateTemplateCards();
      }
      if (data.contacts) {
        activeContacts = data.contacts;
        syncContactToggles();
      }
      if (data.bg) {
        paper.style.setProperty("--bg-color", data.bg);
        document.getElementById("bgColorPicker").value = data.bg;
      }
      if (data.accent) {
        paper.style.setProperty("--accent-color", data.accent);
        document.getElementById("accentColorPicker").value = data.accent;
      }
      if (data.font) {
        paper.style.setProperty("--font-family", data.font);
        paper.style.fontFamily = data.font;
        document.getElementById("fontSelector").value = data.font;
      }
      autoSave();
      initSortables();
      if (window.innerWidth <= 900) {
        toggleSidebar();
        resetZoom();
      }
    } catch (e) {
      alert("Error loading file.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}
