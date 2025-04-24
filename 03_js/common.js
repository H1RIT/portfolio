document.addEventListener("DOMContentLoaded", () => {
  const icons = document.querySelectorAll(".icon");
  const desktop = document.querySelector(".desktop-background");
  const windowTemplate = document.querySelector(".window");

  let zIndex = 10;

  icons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const windowName = icon.getAttribute("data-window");
      let existingWindow = document.querySelector(`.window[data-window="${windowName}"]`);
      
      if (windowName === "mfigma") {
        window.open(
          "https://www.figma.com/proto/LiAP4RlGNuNJ8QA0egWY6t/%E2%98%85-GKST?page-id=0%3A1&node-id=2-16&p=f&viewport=816%2C664%2C0.13&t=iVglfl7asl3iZCb0-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=2%3A16&show-proto-sidebar=1",
          "_blank"
        );
        return;
      }

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
        newWindow.style.width = "430px";
        newWindow.style.height = "900px";
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
        newWindow.querySelector(".window-scroll").style.display = "none";
        newWindow.querySelector(".window-display").style.width = "100%";
        newWindow.querySelector(".window-display").style.overflow = "hidden";
      }

      if (windowName === "profile") {
        const display = newWindow.querySelector(".window-display");
        display.addEventListener("wheel", (e) => {
          e.preventDefault();
          const direction = e.deltaY > 0 ? 1 : -1;
          const next = display.scrollTop + direction * display.clientHeight;
      
          display.scrollTo({
            top: next,
            behavior: "smooth"
          });
        }, { passive: false });
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
    const header = win.querySelector(".window-header");
    header.addEventListener("dblclick", () => {
      const maximizeBtn = win.querySelector(".header-button.maximize");
      const restoreBtn = win.querySelector(".header-button.restore");
      if (restoreBtn.style.display === "flex") {
        restoreBtn.click();
      } else {
        maximizeBtn.click();
      }
    });
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

      const header = win.querySelector(".window-header");
      header.classList.add("no-drag");

      const resizeHandles = win.querySelectorAll(".resize-handle");
      resizeHandles.forEach(handle => handle.style.display = "none");

      if (win.classList.contains("resp")) {
        win.classList.remove("resp");
      }

      syncScroll(win);
    });

    restoreBtn.addEventListener("click", () => {
      win.style.width = prevSize.width;
      win.style.height = prevSize.height;
      win.style.left = prevSize.left;
      win.style.top = prevSize.top;

      restoreBtn.style.display = "none";
      maximizeBtn.style.display = "flex";

      const header = win.querySelector(".window-header");
      header.classList.remove("no-drag");

      const resizeHandles = win.querySelectorAll(".resize-handle");
      resizeHandles.forEach(handle => handle.style.display = "block");

      const viewType = win.getAttribute("data-view");
      if (viewType === "resp") {
        win.classList.add("resp");
      }

      syncScroll(win);
    });
  }

  function enableWindowResize(win) {
    const directions = ["n", "s", "e", "w", "se", "sw", "ne", "nw"];

    directions.forEach((dir) => {
      const handle = document.createElement("div");
      handle.classList.add("resize-handle", `resize-${dir}`);
      handle.style.position = "absolute";
      if (["n", "s"].includes(dir)) {
        handle.style.width = "100%";
        handle.style.height = "10px";
      } else if (["e", "w"].includes(dir)) {
        handle.style.width = "10px";
        handle.style.height = "100%";
      } else {
        handle.style.width = "10px";
        handle.style.height = "10px";
      }
      
      handle.style.zIndex = "1000";
      handle.style.background = "transparent";
      handle.style.cursor = (dir === "n" || dir === "s") ? "ns-resize" :
        (dir === "e" || dir === "w") ? "ew-resize" : `${dir}-resize`;

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

        if (dir.includes("e")) win.style.width = Math.max(500, startWidth + dx) + "px";
        if (dir.includes("s")) win.style.height = Math.max(300, startHeight + dy) + "px";
        if (dir.includes("w")) {
          const rawWidth = startWidth - dx;
          const newWidth = Math.max(500, rawWidth);
          win.style.width = newWidth + "px";
          if (rawWidth > 500) {
            win.style.left = startLeft + dx + "px";
          } else {
            win.style.left = startLeft + (startWidth - 500) + "px";
          }
        }
        if (dir.includes("n")) {
          const rawHeight = startHeight - dy;
          const newHeight = Math.max(300, rawHeight);
          win.style.height = newHeight + "px";
          if (rawHeight > 300) {
            win.style.top = startTop + dy + "px";
          } else {
            win.style.top = startTop + (startHeight - 300) + "px";
          }
        }

        syncScroll(win);
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
      const left = parseInt(topWindow.style.left);
      const top = parseInt(topWindow.style.top);      
      return { left, top };
    } else {
      return { left: 150, top: 60 };
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
    if (header.classList.contains("no-drag")) return;
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
      setTimeout(() => {
        updateThumbSize();
        updateThumbPosition();
      }, 50);
    }, 0);
  }
});
