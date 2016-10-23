import fs = require("fs");
import https = require("https");
import npm = require("npm");

namespace Com.Latipium.Launcher.Electron {
    export class Updater {
        public static NpmInstall(callback: Function) {
            let oldWD = process.cwd();
            process.chdir(`${process.resourcesPath}/app`);
            npm.load({}, err => {
                if ( err ) {
                    console.log(err);
                }
                npm.commands.install([], err => {
                    if ( err ) {
                        console.log(err);
                    }
                    process.chdir(oldWD);
                    callback();
                });
            });
        }

        public static DoUpdate(manifest: any, callback: Function) {
            for ( var i:number = 0; i < manifest.dirs.length; ++i ) {
                try {
                    if ( !fs.statSync(`${process.resourcesPath}/${manifest.dirs[i]}`).isDirectory() ) {
                        fs.mkdirSync(`${process.resourcesPath}/${manifest.dirs[i]}`);
                    }
                } catch ( e ) {
                    console.log(e);
                    fs.mkdirSync(`${process.resourcesPath}/${manifest.dirs[i]}`);
                }
            }
            var finishedFiles = 0;
            for ( var i: number = 0; i < manifest.files.length; ++i ) {
                (file => {
                    https.get(file.from, res => {
                        let fd = fs.createWriteStream(`${process.resourcesPath}/${file.to}`);
                        res.pipe(fd);
                        fd.on("finish", () => {
                            fd.close(() => {
                                if ( ++finishedFiles == manifest.files.length ) {
                                    Updater.NpmInstall(callback);
                                }
                            });
                        });
                    }).on("error", e => {
                        console.log(e);
                        if ( ++finishedFiles == manifest.files.length ) {
                            Updater.NpmInstall(callback);
                        }
                    });
                })(manifest.files[i]);
            }
        }

        public static Run(callback: Function) {
            https.get("https://latipium.com/electron/manifest.json", res => {
                var body = "";
                res.on("data", chunk => body += chunk);
                res.on("end", () => {
                    let newManifest = JSON.parse(body);
                    fs.readFile(`${process.resourcesPath}/app/manifest.json`, "utf8", (err, data) => {
                        if ( err ) {
                            console.log(err);
                            callback();
                        } else {
                            let oldManifest = JSON.parse(data);
                            if ( newManifest.id == oldManifest.id ) {
                                callback();
                            } else {
                                Updater.DoUpdate(newManifest, () => Updater.NpmInstall(callback));
                            }
                        }
                    })
                });
            }).on("error", e => {
                console.log(e);
                callback();
            });
        }
    }
}

namespace _ {
    import Updater = Com.Latipium.Launcher.Electron.Updater;
    Updater.Run(() => require("./electron.js"));
}
