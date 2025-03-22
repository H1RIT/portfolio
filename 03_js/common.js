document.addEventListener("DOMContentLoaded", () => {
  const icons = document.querySelectorAll(".icon");
  const desktop = document.querySelector(".desktop-background");
  const windowTemplate = document.querySelector(".window");

  let zIndex = 10;

  icons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const windowName = icon.getAttribute("data-window");
      let existingWindow = document.querySelector(`.window[data-window="${windowName}"]`);

      if (existingWindow) {
        bringToFront(existingWindow);
        return;
      }

      const newWindow = windowTemplate.cloneNode(true);
      const content = document.querySelector(`.window-content.${windowName}`);
      if (!content) return;

      const viewType = content.getAttribute("data-view");
      newWindow.setAttribute("data-view", viewType);

      if (viewType === "mobile") {
        newWindow.style.width = "370px";
        newWindow.style.height = "800px";
        newWindow.querySelector(".window-scroll").style.display = "none";
        newWindow.querySelector(".window-display").style.overflow = "hidden";
        newWindow.querySelector(".window-display").style.width = "100%";
        newWindow.querySelector(".window-header .header-tab").style.width = "140px";

        const maximizeSvg = newWindow.querySelector(".header-button.maximize svg path");
        maximizeSvg.setAttribute("fill", "#ccc");
        newWindow.querySelector(".header-button.maximize").style.pointerEvents = "none";
      } else {
        newWindow.style.width = "1400px";
        newWindow.style.height = "800px";
      }

      if (viewType === "resp") {
        newWindow.classList.add("resp");
        enableWindowResize(newWindow);
      }

      newWindow.classList.add("cloned");
      newWindow.setAttribute("data-window", windowName);
      newWindow.style.display = "flex";
      newWindow.style.zIndex = ++zIndex;

      const { left, top } = getTopWindowPosition();
      newWindow.style.left = `${left + 30}px`;
      newWindow.style.top = `${top + 30}px`;

      const displayArea = newWindow.querySelector(".window-display");
      displayArea.innerHTML = "";
      displayArea.appendChild(content.cloneNode(true));

      newWindow.addEventListener("mousedown", () => {
        bringToFront(newWindow);
      });

      addDragFunctionality(newWindow);
      addCloseFunctionality(newWindow);
      addMaximizeFunctionality(newWindow);
      syncScroll(newWindow);

      desktop.appendChild(newWindow);
    });
  });

  function addMaximizeFunctionality(win) {
    const maximizeBtn = win.querySelector(".header-button.maximize");
    const restoreBtn = win.querySelector(".header-button.restore");
    const viewType = win.getAttribute("data-view");
    let prevSize = {};

    if (viewType === "mobile") return;

    maximizeBtn.addEventListener("click", () => {
      prevSize = {
        width: win.style.width,
        height: win.style.height,
        left: win.style.left,
        top: win.style.top
      };

      win.style.width = `${window.innerWidth - 20}px`;
      win.style.height = `${window.innerHeight - 20}px`;
      win.style.left = "10px";
      win.style.top = "10px";

      maximizeBtn.style.display = "none";
      restoreBtn.style.display = "flex";
      syncScroll(win);
    });

    restoreBtn.addEventListener("click", () => {
      win.style.width = prevSize.width;
      win.style.height = prevSize.height;
      win.style.left = prevSize.left;
      win.style.top = prevSize.top;

      restoreBtn.style.display = "none";
      maximizeBtn.style.display = "flex";
      syncScroll(win);
    });
  }

  function enableWindowResize(win) {
    const directions = ["se", "sw", "ne", "nw"];

    directions.forEach((dir) => {
      const handle = document.createElement("div");
      handle.classList.add("resize-handle", `resize-${dir}`);
      handle.style.position = "absolute";
      handle.style.width = "10px";
      handle.style.height = "10px";
      handle.style.zIndex = "1000";
      handle.style.background = "transparent";
      handle.style.cursor = `${dir}-resize`;

      if (dir.includes("s")) handle.style.bottom = "0";
      if (dir.includes("n")) handle.style.top = "0";
      if (dir.includes("e")) handle.style.right = "0";
      if (dir.includes("w")) handle.style.left = "0";

      win.appendChild(handle);

      let isResizing = false;
      let startX, startY, startWidth, startHeight, startLeft, startTop;

      handle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(window.getComputedStyle(win).width);
        startHeight = parseInt(window.getComputedStyle(win).height);
        startLeft = win.offsetLeft;
        startTop = win.offsetTop;
        document.body.style.userSelect = "none";
      });

      document.addEventListener("mousemove", (e) => {
        if (!isResizing) return;
        let dx = e.clientX - startX;
        let dy = e.clientY - startY;

        if (dir.includes("e")) win.style.width = startWidth + dx + "px";
        if (dir.includes("s")) win.style.height = startHeight + dy + "px";
        if (dir.includes("w")) {
          win.style.width = startWidth - dx + "px";
          win.style.left = startLeft + dx + "px";
        }
        if (dir.includes("n")) {
          win.style.height = startHeight - dy + "px";
          win.style.top = startTop + dy + "px";
        }

        syncScroll(win); // 업데이트할 때마다 스크롤도 재계산
      });

      document.addEventListener("mouseup", () => {
        isResizing = false;
        document.body.style.userSelect = "";
      });
    });
  }

  function getTopWindowPosition() {
    const windows = document.querySelectorAll(".window.cloned");
    let topZ = 0;
    let topWindow = null;

    windows.forEach((win) => {
      const z = parseInt(win.style.zIndex || 0);
      if (z > topZ) {
        topZ = z;
        topWindow = win;
      }
    });

    if (topWindow) {
      const left = parseInt(topWindow.style.left || 100);
      const top = parseInt(topWindow.style.top || 100);
      return { left, top };
    } else {
      return { left: 100, top: 100 };
    }
  }

  function bringToFront(win) {
    win.style.zIndex = ++zIndex;
  }

  function addCloseFunctionality(win) {
    const closeBtn = win.querySelector(".header-button.close");
    closeBtn.addEventListener("click", () => {
      win.remove();
    });
  }

  function addDragFunctionality(win) {
    const header = win.querySelector(".window-header");
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(win.style.left);
      startTop = parseInt(win.style.top);
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      win.style.left = `${startLeft + dx}px`;
      win.style.top = `${startTop + dy}px`;
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.userSelect = "";
    });
  }

  function syncScroll(windowEl) {
    const display = windowEl.querySelector(".window-display");
    const track = windowEl.querySelector(".scroll-track");
    const thumb = windowEl.querySelector(".scroll-thumb");
    const btnUp = windowEl.querySelectorAll(".scroll-button")[0];
    const btnDown = windowEl.querySelectorAll(".scroll-button")[1];

    function updateThumbSize() {
      const ratio = display.clientHeight / display.scrollHeight;
      const thumbHeight = Math.max(track.clientHeight * ratio, 30);
      thumb.style.height = `${Math.min(thumbHeight, track.clientHeight - 4)}px`;
    }

    function updateThumbPosition() {
      const ratio = display.scrollTop / (display.scrollHeight - display.clientHeight);
      const maxTop = track.clientHeight - thumb.offsetHeight - 4;
      thumb.style.top = `${ratio * maxTop}px`;
    }

    let isDragging = false;
    let startY, startScrollTop;

    thumb.addEventListener("mousedown", (e) => {
      isDragging = true;
      startY = e.clientY;
      startScrollTop = display.scrollTop;
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dy = e.clientY - startY;
      const scrollable = display.scrollHeight - display.clientHeight;
      const maxThumbTop = track.clientHeight - thumb.offsetHeight;
      const scrollRatio = scrollable / maxThumbTop;
      display.scrollTop = startScrollTop + dy * scrollRatio;
      updateThumbPosition();
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.userSelect = "";
    });

    btnUp.addEventListener("click", () => {
      display.scrollTop -= 100;
      updateThumbPosition();
    });
    btnDown.addEventListener("click", () => {
      display.scrollTop += 100;
      updateThumbPosition();
    });

    display.addEventListener("scroll", updateThumbPosition);
    window.addEventListener("resize", updateThumbSize);

    setTimeout(() => {
      updateThumbSize();
      updateThumbPosition();
    }, 0);
  }
});
