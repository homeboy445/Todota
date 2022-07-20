/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, Menu } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
// import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import Server from '../backend/src/index';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let addTodoTaskWindow: BrowserWindow | null = null;
let composeNoteWindow: BrowserWindow | null = null;
const SERVER = new Server();

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const getAssetPath = (...paths: string[]): string => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');
  return path.join(RESOURCES_PATH, ...paths);
};

const broadCastWindowType = (window: BrowserWindow, type: string): void => {
  if (!window) return;
  setTimeout(() => {
    window.webContents.send('window-type', type);
  }, 1000);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 378,
    height: 457,
    resizable: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath(''));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', async () => {
    mainWindow = null;
    await SERVER.dispose();
    app.quit();
  });

  const MainMenu = Menu.buildFromTemplate([
    {
      label: 'User',
      submenu: [
        {
          label: 'log out',
          click: () => {
            mainWindow?.webContents?.send('log_out');
          },
        },
      ],
    },
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Todo',
          click: () => {
            mainWindow?.loadURL(resolveHtmlPath(''));
            if (composeNoteWindow !== null) {
              composeNoteWindow.close();
            }
          },
        },
        {
          label: 'Notes',
          click: () => {
            mainWindow?.loadURL(resolveHtmlPath('Notes'));
            if (addTodoTaskWindow !== null) {
              addTodoTaskWindow.close();
            }
          },
        },
        {
          label: 'Secrets',
          click: () => {
            mainWindow?.loadURL(resolveHtmlPath('secrets'));
            if (addTodoTaskWindow !== null) {
              addTodoTaskWindow.close();
            }
            if (composeNoteWindow !== null) {
              composeNoteWindow.close();
            }
          },
        },
      ],
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Todo',
          submenu: [
            {
              label: 'Sort Tasks',
              submenu: [
                {
                  label: 'Sort in',
                  submenu: [
                    {
                      label: 'ascending',
                      click: () => {},
                    },
                    {
                      label: 'descending',
                      click: () => {},
                    },
                  ],
                },
                {
                  label: 'Sort by',
                  submenu: [
                    {
                      label: 'Priority',
                      click: () => {},
                    },
                    {
                      label: 'Date',
                      click: () => {},
                    },
                  ],
                },
              ],
            },
            {
              label: 'Show stats',
              click: () => {},
            },
          ],
        },
        {
          label: 'Notes',
          submenu: [
            {
              label: 'Search',
              submenu: [
                {
                  label: 'case-sensitivity',
                  submenu: [
                    {
                      label: 'on',
                      click: () => {},
                    },
                    {
                      label: 'off',
                      click: () => {},
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(MainMenu);

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  broadCastWindowType(mainWindow, 'parent');
};

ipcMain.on('session-expired', (err, data) => {
  addTodoTaskWindow?.close();
  composeNoteWindow?.close();
  mainWindow?.loadURL('/');
});

const createAddTaskWindow = () => {
  addTodoTaskWindow = new BrowserWindow({
    show: false,
    width: 325,
    height: 315,
    resizable: false,
    icon: getAssetPath('icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  addTodoTaskWindow.loadURL(resolveHtmlPath('todo:addTodo'));

  addTodoTaskWindow.on('ready-to-show', () => {
    if (!addTodoTaskWindow) {
      throw new Error('"addTodoTaskWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      addTodoTaskWindow.minimize();
    } else {
      addTodoTaskWindow.show();
    }
  });

  addTodoTaskWindow.on('closed', () => {
    addTodoTaskWindow = null;
  });

  broadCastWindowType(addTodoTaskWindow, 'child');
};

ipcMain.on('todo:open-add-task-window', (event, arg) => {
  if (addTodoTaskWindow === null) {
    createAddTaskWindow();
    setTimeout(() => {
      addTodoTaskWindow?.webContents.send('todo:addTask.edit', arg);
    }, 2000);
  }
});

// addTodo: received task data from AddTask window
// addTask: send to Todo window
ipcMain.on('todo:addTodo', (event, arg) => {
  console.log('>>> ', arg);
  addTodoTaskWindow?.close();
  mainWindow?.webContents.send('todo:addTask', arg);
});

const createComposeNoteWindow = (type: string) => {
  composeNoteWindow = new BrowserWindow({
    show: false,
    width: 325,
    height: 315,
    resizable: false,
    icon: getAssetPath('icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  composeNoteWindow.loadURL(resolveHtmlPath(`notes:compose/${type}`));

  composeNoteWindow.on('ready-to-show', () => {
    if (!composeNoteWindow) {
      throw new Error('"composeNoteWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      composeNoteWindow.minimize();
    } else {
      composeNoteWindow.show();
    }
  });

  composeNoteWindow.on('closed', () => {
    composeNoteWindow = null;
  });

  broadCastWindowType(composeNoteWindow, 'child');
};

ipcMain.on('notes:compose', (event, data) => {
  if (composeNoteWindow === null) {
    createComposeNoteWindow(data.type || 'edit');
    if (data.type === 'view') {
      setTimeout(() => {
        console.log(data);
        composeNoteWindow?.webContents.send(
          'notes:compose.edit',
          data.description || ''
        );
      }, 2000);
    }
  }
});

ipcMain.on('notes:compose.addNote', (event, data) => {
  mainWindow?.webContents.send('notes:addNote', data);
  composeNoteWindow?.close();
});

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    console.log(SERVER);
    // SERVER.run(); // Running the Todota Backend Server!
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
