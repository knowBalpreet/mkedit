const fs = require("fs");
const { app, BrowserWindow, dialog } = require("electron");

let mainWindow = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadFile(`${__dirname}/index.html`);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
});

exports.getFileFromUser = async () => {
  const files = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    buttonLabel: "Unveil",
    title: "Open Fire Sale Document",
    filters: [
      {
        name: "Markdown Files",
        extensions: ["md", "mdown", "markdown", "marcdown"],
      },
      { name: "Text Files", extensions: ["txt", "text"] },
    ],
  });
  if (files.canceled) return;

  const file = files.filePaths[0];

  openFile(file);
};

exports.saveFile = async (file, content) => {
  if (!file) {
    let currentFile = await dialog.showSaveDialog(mainWindow, {
      title: "Save Markdown",
      defaultPath: app.getPath("desktop"),
      filters: [
        {
          name: "Markdown Files",
          extensions: ["md", "mdown", "markdown", "marcdown"],
        },
      ],
    });
    if (currentFile.canceled) return;
    file = currentFile.filePath;
  }
  fs.writeFileSync(file, content);
  openFile(file);
};

exports.saveHTML = async (content) => {
  let currentFile = await dialog.showSaveDialog(mainWindow, {
    title: "Save HTML",
    defaultPath: app.getPath("desktop"),
    filters: [
      {
        name: "HTML Files",
        extensions: ["html", "htm"],
      },
    ],
  });
  if (currentFile.canceled) return;
  fs.writeFileSync(currentFile.filePath, content);
};

const openFile = (exports.openFile = (file) => {
  const content = fs.readFileSync(file).toString();
  app.addRecentDocument(file);

  mainWindow.webContents.send("file-opened", file, content);
});
