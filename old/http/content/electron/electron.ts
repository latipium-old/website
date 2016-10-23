/// <reference path="updater.ts" />
import electron = require("electron");
import app = electron.app;
import BrowserWindow = electron.BrowserWindow;

namespace Com.Latipium.Launcher.Electron {
    export class Window {
        private Win;

        public IsOpen(): boolean {
            return this.Win != null;
        }

        public Open(): void {
            this.Win = new BrowserWindow({
                width: 800,
                height: 600
            });
            this.Win.loadURL(`file://${__dirname}/../play/launch.html`);
            this.Win.webContents.on("did-get-redirect-request", (e, oldURL, newURL, isMainFrame, httpResponseCode, requestMethod, referer, header) => {
                setTimeout(() => this.Win.loadURL(newURL), 0);
                e.preventDefault();
            });
            this.Win.on("closed", function() {
                this.win = null;
            });
        }

        public constructor() {
            this.Open();
        }
    }

    export class Setup {
        private static Window: Window;

        public static Main(): void {
            app.on("window-all-closed", function() {
                if ( process.platform != "darwin" ) {
                    app.quit();
                }
            });
            app.on("activate", function() {
                if ( !Setup.Window.IsOpen() ) {
                    Setup.Window.Open();
                }
            });
            Setup.Window = new Window();
        }
    }
}

namespace _ {
    import Setup = Com.Latipium.Launcher.Electron.Setup;
    Setup.Main();
}
