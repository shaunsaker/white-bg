import { app, BrowserWindow, globalShortcut, screen } from "electron";
import * as path from "path";
import * as os from "os";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

interface Window extends BrowserWindow {
  hidden?: boolean;
}

const windows: Window[] = [];

const createDisplays = () => {
  // get all of the displays
  const displays = screen.getAllDisplays();

  // for each display, create a new window using the same index.html (white bg)
  displays.forEach((display) => {
    // Create the browser window.
    const window = new BrowserWindow({
      fullscreen: true,
      ...display.bounds,
    });

    // and load the index.html of the app.
    window.loadFile(path.join(__dirname, "../src/index.html"));

    windows.push(window);
  });
};

const isMac = os.platform() === "darwin";

const hideWindow = (window: Window) => {
  // on mac, if you hide a window while fullscreen, you get a black screen of death
  if (isMac && window.isFullScreen) {
    window.setFullScreen(false);

    setTimeout(() => {
      window.hide();
    }, 750);
  } else {
    window.hide();
    window.hidden = true;
  }
};

const showWindow = (window: Window) => {
  window.setFullScreen(true);
  window.show();
  window.hidden = false;
};

const createShortcuts = () => {
  // hide all windows
  globalShortcut.register("Esc", () => {
    windows.forEach((window) => {
      hideWindow(window);
    });
  });

  // show all windows
  globalShortcut.register("CmdOrCtrl+Shift+B", () => {
    windows.forEach((window) => {
      showWindow(window);
    });
  });

  // sort by the x bounds
  // show/hide individual window
  windows
    .sort((a, b) => {
      const boundsA = a.getBounds();
      const boundsB = b.getBounds();

      if (boundsA.x < boundsB.x) {
        return -1;
      }

      return 1;
    })
    .forEach((window, index) => {
      globalShortcut.register(`CmdOrCtrl+Shift+${index + 1}`, () => {
        if (window.hidden) {
          showWindow(window);
        } else {
          hideWindow(window);
        }
      });
    });
};

const createWindow = (): void => {
  createDisplays();

  createShortcuts();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
