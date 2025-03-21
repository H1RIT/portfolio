document.addEventListener("DOMContentLoaded", () => {
  const icons = document.querySelectorAll(".icon");
  const desktop = document.querySelector(".desktop-background");
  const windowTemplate = document.querySelector(".window");
  const windowContents = document.querySelectorAll(".window-content");

  let zIndex = 10;
  let offsetX = 0;
  let offsetY = 0;

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

      newWindow.classList.add("cloned");
      newWindow.setAttribute("data-window", windowName);
      newWindow.style.display = "flex";
      newWindow.style.zIndex = ++zIndex;
      newWindow.style.left = `${100 + offsetX}px`;
      newWindow.style.top = `${50 + offsetY}px`;

      const displayArea = newWindow.querySelector(".window-display");
      displayArea.innerHTML = "";
      displayArea.appendChild(content.cloneNode(true));

      addDragFunctionality(newWindow);
      addCloseFunctionality(newWindow);

      desktop.appendChild(newWindow);

      offsetX += 35;
      offsetY += 35;
    });
  });

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
      bringToFront(win);
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
});
