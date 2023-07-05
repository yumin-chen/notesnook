/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2023 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import {
  app,
  BrowserWindow,
  inAppPurchase,
  nativeTheme,
  session,
  shell
} from "electron";
import { isDevelopment } from "./utils";
import { registerProtocol, PROTOCOL_URL } from "./utils/protocol";
import { configureAutoUpdater } from "./utils/autoupdater";
import { getBackgroundColor, getTheme, setTheme } from "./utils/theme";
import { setupMenu } from "./utils/menu";
import { WindowState } from "./utils/window-state";
import { AutoLaunch } from "./utils/autolaunch";
import { setupJumplist } from "./utils/jumplist";
import { setupTray } from "./utils/tray";
import { CLIOptions, parseArguments } from "./cli";
import { AssetManager } from "./utils/asset-manager";
import { createIPCHandler } from "electron-trpc/main";
import { router, api } from "./api";
import { config } from "./utils/config";
import path from "path";

if (!RELEASE) {
  require("electron-reloader")(module);
}

if (process.platform == "win32" && process.env.PORTABLE_EXECUTABLE_DIR) {
  console.log("Portable app: true");
  const root = path.join(process.env.PORTABLE_EXECUTABLE_DIR, "Notesnook");
  app.setPath("appData", path.join(root, "AppData"));
  app.setPath("documents", path.join(root, "Documents"));
  app.setPath("userData", path.join(root, "UserData"));
}

// only run a single instance
if (!MAC_APP_STORE && !app.requestSingleInstanceLock()) {
  app.exit();
}

if (process.platform === "win32") {
  app.setAppUserModelId(app.name);
}

app.commandLine.appendSwitch("lang", "en-US");

async function createWindow() {
  const cliOptions = await parseArguments();
  setTheme(getTheme());

  const mainWindowState = new WindowState({});
  const mainWindow = new BrowserWindow({
    show: !cliOptions.hidden,
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    darkTheme: getTheme() === "dark",
    backgroundColor: getBackgroundColor(),
    opacity: 0,
    autoHideMenuBar: true,
    icon: AssetManager.appIcon({
      size: 512,
      format: process.platform === "win32" ? "ico" : "png"
    }),
    webPreferences: {
      zoomFactor: config.zoomFactor,
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: config.isSpellCheckerEnabled,
      preload: __dirname + "/preload.js"
    }
  });

  globalThis.window = mainWindow;
  mainWindowState.manage(mainWindow);

  if (cliOptions.hidden && !config.desktopSettings.minimizeToSystemTray)
    mainWindow.minimize();

  setTimeout(() => {
    mainWindow.setOpacity(1);
  }, 70);

  setupDesktopIntegration();
  createIPCHandler({ router, windows: [mainWindow] });

  await mainWindow.webContents.loadURL(`${createURL(cliOptions, "/")}`);

  mainWindow.webContents.session.setSpellCheckerDictionaryDownloadURL(
    "http://dictionaries.notesnook.com/"
  );

  mainWindow.once("closed", () => {
    globalThis.window = null;
  });

  setupMenu();
  setupJumplist();

  if (isDevelopment())
    mainWindow.webContents.openDevTools({ mode: "right", activate: true });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  nativeTheme.on("updated", () => {
    setupTray();
    setupJumplist();
  });

  await AssetManager.loadIcons();
  if (config.privacyMode) {
    await api.integration.setPrivacyMode(config.privacyMode);
  }
}

app.once("ready", async () => {
  console.info("App ready. Opening window.");

  if (!isDevelopment()) registerProtocol();
  await createWindow();

  // Listen for transactions as soon as possible.
  inAppPurchase.on("transactions-updated", (_: any, transactions: any[]) => {
    if (!Array.isArray(transactions)) {
      return;
    }

    // Check each transaction.
    transactions.forEach((transaction) => {
      const payment = transaction.payment;

      switch (transaction.transactionState) {
        case "purchasing":
          console.log(`Purchasing ${payment.productIdentifier}...`);
          break;

        case "purchased": {
          console.log(`${payment.productIdentifier} purchased.`);

          // Get the receipt url.
          const receiptURL = inAppPurchase.getReceiptURL();

          console.log(`Receipt URL: ${receiptURL}`);

          // Submit the receipt file to the server and check if it is valid.
          // @see https://developer.apple.com/library/content/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html
          // ...
          // If the receipt is valid, the product is purchased
          // ...

          // Finish the transaction.
          // inAppPurchase.finishTransactionByDate(transaction.transactionDate);

          break;
        }

        case "failed":
          console.log(
            `Failed to purchase ${payment.productIdentifier}.`,
            JSON.stringify(transaction, undefined, 2)
          );

          // Finish the transaction.
          // inAppPurchase.finishTransactionByDate(transaction.transactionDate);

          break;
        case "restored":
          console.log(
            `The purchase of ${payment.productIdentifier} has been restored.`
          );

          break;
        case "deferred":
          console.log(
            `The purchase of ${payment.productIdentifier} has been deferred.`
          );

          break;
        default:
          break;
      }
    });
  });

  // Check if the user is allowed to make in-app purchase.
  if (!inAppPurchase.canMakePayments()) {
    console.log("The user is not allowed to make in-app purchase.");
  }

  configureAutoUpdater();
});

app.once("window-all-closed", () => {
  if (process.platform !== "darwin" || MAC_APP_STORE) {
    app.quit();
  }
});

app.on("activate", () => {
  if (globalThis.window === null) {
    createWindow();
  }
});

function createURL(options: CLIOptions, path = "/") {
  const url = new URL(isDevelopment() ? "http://localhost:3000" : PROTOCOL_URL);

  url.pathname = path;
  if (options.note === true) url.hash = "/notes/create/1";
  else if (options.notebook === true) url.hash = "/notebooks/create";
  else if (options.reminder === true) url.hash = "/reminders/create";
  else if (typeof options.note === "string")
    url.hash = `/notes/${options.note}/edit`;
  else if (typeof options.notebook === "string")
    url.hash = `/notebooks/${options.notebook}`;

  return url;
}

function setupDesktopIntegration() {
  const desktopIntegration = config.desktopSettings;

  if (
    desktopIntegration.closeToSystemTray ||
    desktopIntegration.minimizeToSystemTray
  ) {
    setupTray();
  }

  // when close to system tray is enabled, it becomes nigh impossible
  // to "quit" the app. This is necessary in order to fix that.
  if (desktopIntegration.closeToSystemTray) {
    app.on("before-quit", () => app.exit(0));
  }

  globalThis.window?.once("close", (e) => {
    if (config.desktopSettings.closeToSystemTray) {
      e.preventDefault();
      if (process.platform == "darwin") {
        // on macOS window cannot be minimized/hidden if it is already fullscreen
        // so we just close it.
        if (globalThis.window?.isFullScreen()) app.exit(0);
        else app.hide();
      } else {
        globalThis.window?.minimize();
        globalThis.window?.hide();
      }
    }
  });

  globalThis.window?.on("minimize", () => {
    if (config.desktopSettings.minimizeToSystemTray) {
      if (process.platform == "darwin") {
        app.hide();
      } else {
        globalThis.window?.hide();
      }
    }
  });

  if (desktopIntegration.autoStart) {
    AutoLaunch.enable(!!desktopIntegration.startMinimized);
  }
}
