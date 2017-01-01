namespace Com.Latipium.Website.Play.Launcher {
    export interface IDirectoryController {
        Exists(dir: string, callback: (exists: boolean) => void): void;

        List(dir: string, callback: (files: string[], dirs: string[]) => void): void;

        Mkdir(dir: string, callback: (success: boolean) => void): void;

        Rmdir(dir: string, callback: (success: boolean) => void): void;
    }

    export interface IEnvironmentController {
        GetOS(callback: (os: string) => void): void;

        GetArch(callback: (is64: boolean) => void): void;

        GetVariables(callback: (vars: any) => void): void;

        GetFolders(callback: (folders: any) => void): void;
    }

    export interface IFileController {
        Exists(file: string, callback: (exists: boolean) => void): void;

        Read(file: string, callback: (contents: string) => void): void;

        Write(file: string, contents: string, callback: (success: boolean) => void): void;

        Download(file: string, url: string, callback: (success: boolean) => void): void;

        Delete(file: string, callback: (success: boolean) => void): void;
    }

    export interface IProcess {
        SetReadCallback(callback: (stdout: string, stderr: string) => void): void;

        SetKilledCallback(callback: () => void): void;

        SetPollInterval(interval: number): void;

        Send(stdin: string, callback: (success: boolean) => void): void;

        Kill(callback: (exitCode: number) => void): void;
    }

    export interface IProcessController {
        List(callback: (procs: IProcess[]) => void): void;

        Spawn(exe: string, args: string, dir: string, env: any, callback: (proc: IProcess) => void): void;
    }

    export interface INetworkController {
        Get(url: string, callback: (result: string) => void): void;

        Post(url: string, data: string, callback: (result: string) => void): void;
    }

    export interface ILauncherFactory {
        IsRunning(callback: (running: boolean) => void): void;

        CreateDirectoryController(): IDirectoryController;

        CreateEnvironmentController(): IEnvironmentController;

        CreateFileController(): IFileController;

        CreateProcessController(): IProcessController;

        CreateNetworkController(): INetworkController;
    }

    class LauncherFactoryFactory {
        private Implementations: ILauncherFactory[] = [
            new Daemon.DaemonFactory()
        ];

        public GetFactory(callback: (factory: ILauncherFactory) => void): void {
            let test = i => {
                if ( i < this.Implementations.length ) {
                    this.Implementations[i].IsRunning(running => {
                        if ( running ) {
                            callback(this.Implementations[i]);
                        } else {
                            test(i + 1);
                        }
                    });
                } else {
                    callback(null);
                }
            };
            test(0);
        }
    }

    export interface IDisplayOption {
        TransformEnvironment(env: any): void;

        GetDisplayName(): string;

        GetField(): string;
    }

    class X11SocketOption implements IDisplayOption {
        private display: string;

        public TransformEnvironment(env: any): void {
            env.DISPLAY = this.display;
        }

        public GetDisplayName(): string {
            return this.display;
        }

        public GetField(): string {
            return "X11 Server";
        }

        public constructor(display: string) {
            this.display = display;
        }
    }

    class XAuthorityOption implements IDisplayOption {
        private user: string;
        private file: string;

        public TransformEnvironment(env: any): void {
            env.XAUTHORITY = this.file;
        }

        public GetDisplayName(): string {
            return this.user;
        }

        public GetField(): string {
            return "UNIX User";
        }

        public constructor(user: string, file: string) {
            this.user = user;
            this.file = file;
        }
    }

    export class KeyValuePair {
        public Key: string;
        public Value: any;

        public constructor(key: string, value: any) {
            this.Key = key;
            this.Value = value;
        }
    }

    export class DisplayConfig {
        private Fields: string[] = [];
        private Options: { [field: string]: IDisplayOption[] } = {};
        private SelectedOptions: { [field: string]: IDisplayOption } = {};
        private SelectOptions: { [field: string]: KeyValuePair[] } = {};

        public AddOption(option: IDisplayOption): void {
            let field: string = option.GetField();
            if ( this.Fields.indexOf(field) >= 0 ) {
                this.Options[field].push(option);
                this.SelectOptions[field].push(new KeyValuePair(option.GetDisplayName(), this.Options[field].length - 1));
            } else {
                this.Fields.push(field);
                this.Options[field] = [
                    option
                ];
                this.SelectOptions[field] = [
                    new KeyValuePair(option.GetDisplayName(), 0)
                ];
                this.SelectedOptions[field] = option;
            }
        }

        public GetFields(): string[] {
            return this.Fields;
        }

        public GetOptions(field: string): IDisplayOption[] {
            return this.Options[field];
        }

        public GetOptionsForSelect(field: string): KeyValuePair[] {
            return this.SelectOptions[field];
        }

        public SelectOption(option: IDisplayOption): void {
            console.error(option.GetDisplayName());
            this.SelectedOptions[option.GetField()] = option;
        }

        public TransformEnvironment(env: any) {
            for ( var i: number = 0; i < this.Fields.length; ++i ) {
                this.SelectedOptions[this.Fields[i]].TransformEnvironment(env);
            }
        }
    }

    export class Launcher {
        private DirectoryController: IDirectoryController;
        private EnvironmentController: IEnvironmentController;
        private FileController: IFileController;
        private ProcessController: IProcessController;
        private NetworkController: INetworkController;
        private RootDirectory: string;
        private PathSeparator: string;
        private UseMono: boolean;
        private MonoPath: string;

        public LaunchCLRProcess(exe: string, args: string, dir: string, callback: (proc: IProcess) => void, envTransform: (env: any) => any = env => env, useMono: () => boolean = () => this.UseMono): void {
            this.EnvironmentController.GetVariables(vars => {
                let env: any = {};
                let envNames: string[] = Object.getOwnPropertyNames(vars);
                for ( var i = 0; i < envNames.length; ++i ) {
                    env[envNames[i]] = vars[envNames[i]];
                }
                env = envTransform(env);
                if ( useMono() ) {
                    if ( this.MonoPath ) {
                        this.ProcessController.Spawn(this.MonoPath, "\"" + exe + "\" " + args, dir, env, callback);
                    } else {
                        this.EnvironmentController.GetOS(os => {
                            let path: string[] = env.PATH.split(os == "windows" ? /;/g : /[:;]/g);
                            let mono: string = os == "windows" ? "mono.exe" : "mono";
                            var failed: number = 0;
                            for ( var i: number = 0; i < path.length; ++i ) {
                                ((testPath: string) => {
                                    this.FileController.Exists(testPath, exists => {
                                        if ( exists ) {
                                            if ( !this.MonoPath ) {
                                                this.MonoPath = testPath;
                                                this.ProcessController.Spawn(testPath, "\"" + exe + "\" " + args, dir, env, callback);
                                            }
                                        } else {
                                            if ( ++failed == path.length ) {
                                                callback(null);
                                            }
                                        }
                                    });
                                })(path[i] + this.PathSeparator + mono);
                            }
                        });
                    }
                } else {
                    this.ProcessController.Spawn(exe, args, dir, env, callback);
                }
            });
        }

        public EnsureDirectoryExists(dir: string, callback: () => void, error: () => void): void {
            this.DirectoryController.Exists(dir, exists => {
                if ( exists ) {
                    callback();
                } else {
                    let dirs: string[] = dir.split(this.PathSeparator);
                    let check = (i) => {
                        if ( dirs.length > 0 ) {
                            this.DirectoryController.Exists(dirs.slice(0, i).join(this.PathSeparator), exists => {
                                if ( exists ) {
                                    let create = (i) => {
                                        if ( i <= dirs.length ) {
                                            this.DirectoryController.Mkdir(dirs.slice(0, i).join(this.PathSeparator), success => {
                                                if ( success ) {
                                                    create(i + 1);
                                                } else {
                                                    error();
                                                }
                                            });
                                        } else {
                                            callback();
                                        }
                                    };
                                    create(i + 1);
                                } else {
                                    check(i - 1);
                                }
                            });
                        } else {
                            error();
                        }
                    };
                    check(dirs.length - 1);
                }
            });
        }

        public GetDirName(file: string): string {
            let parts: string[] = file.split(this.PathSeparator);
            return parts.slice(0, parts.length - 1).join(this.PathSeparator);
        }

        public GetVersion(pkg: string, callback: (ver: string) => void) {
            this.FileController.Read(this.RootDirectory + this.PathSeparator + "packages.config", contents => {
                let doc: XMLDocument = $.parseXML(contents);
                let elements = doc.getElementsByTagName("package");
                for ( var i = 0; i < elements.length; ++i ) {
                    if ( elements[i].getAttribute("id") == pkg ) {
                        callback(elements[i].getAttribute("version"));
                        return;
                    }
                }
                callback(null);
            });
        }

        public GetLaunchEnvironment(display: DisplayConfig, callback: (env: any) => void): void {
            this.GetVersion("Com.Latipium.Security", securityVersion => {
                this.GetVersion("Com.Latipium.Core", coreVersion => {
                    this.GetVersion("log4net", logVersion => {
                        let securityPath = this.RootDirectory + this.PathSeparator + "Com.Latipium.Security." + securityVersion + this.PathSeparator + "lib" + this.PathSeparator + "net45";
                        let corePath = this.RootDirectory + this.PathSeparator + "Com.Latipium.Core." + coreVersion + this.PathSeparator + "lib" + this.PathSeparator + "net45";
                        let logPath = this.RootDirectory + this.PathSeparator + "log4net." + logVersion + this.PathSeparator + "lib" + this.PathSeparator + "net45-full";
                        this.EnvironmentController.GetOS(os => {
                            let sep = os == "windows" ? ";" : ":";
                            let dpath = securityPath + sep + corePath + sep + logPath;
                            this.EnvironmentController.GetVariables(env => {
                                let newEnv: any = {};
                                let keys = Object.getOwnPropertyNames(env);
                                for ( var i = 0; i < keys.length; ++i ) {
                                    newEnv[keys[i]] = env[keys[i]];
                                }
                                newEnv.PATH = env.PATH + sep + dpath;
                                newEnv.MONO_PATH = dpath;
                                display.TransformEnvironment(newEnv);
                                callback(newEnv);
                            });
                        });
                    });
                });
            });
        }

        public Launch(entry: string, display: DisplayConfig, stdin: (stdin: (stdin: string) => void) => void = () => {}, stdout: (stdout: string) => void = () => {}, stderr: (stderr: string) => void = () => {}, killed: (exitCode: number) => void = () => {}) {
            this.GetVersion("Com.Latipium." + entry, entryVersion => {
                this.GetLaunchEnvironment(display, env => {
                    this.LaunchCLRProcess(this.RootDirectory + this.PathSeparator + "Com.Latipium." + entry + "." + entryVersion + this.PathSeparator + "bin" + this.PathSeparator + "Com.Latipium." + entry + ".exe", "", this.RootDirectory, proc => {
                        proc.SetKilledCallback(() => {
                            proc.Kill(killed);
                        });
                        proc.SetReadCallback((out, err) => {
                            if ( out ) {
                                console.info(out);
                                stdout(out);
                            }
                            if ( err ) {
                                console.error(err);
                                stderr(err);
                            }
                        });
                        stdin(input => {
                            proc.Send(input, () => {});
                        });
                    }, () => env);
                });
            });
        }

        public GetDisplays(callback: (displays: DisplayConfig) => void): void {
            this.EnvironmentController.GetOS(os => {
                let displays: DisplayConfig = new DisplayConfig();
                if ( os == "linux" ) {
                    this.FileController.Read("/etc/passwd", passwd => {
                        let lines: string[] = passwd.split("\n");
                        let loop = (i: number) => {
                            if ( i < lines.length ) {
                                let fields: string[] = lines[i].split(":");
                                if ( fields[6] != "/bin/false" && fields[6] != "/usr/sbin/nologin" ) {
                                    let xauthority = fields[5] + this.PathSeparator + ".Xauthority";
                                    this.FileController.Exists(xauthority, exists => {
                                        if ( exists ) {
                                            displays.AddOption(new XAuthorityOption(fields[0], xauthority));
                                        }
                                        loop(i + 1);
                                    });
                                } else {
                                    loop(i + 1);
                                }
                            } else {
                                this.DirectoryController.List("/tmp/.X11-unix/", socks => {
                                    for ( let i: number = 0; i < socks.length; ++i ) {
                                        let sock: string = socks[i].split("/")[3];
                                        if ( sock[0] == "X" ) {
                                            displays.AddOption(new X11SocketOption(":" + sock.substr(1)));
                                        }
                                    }
                                    callback(displays);
                                });
                            }
                        };
                        loop(0);
                    });
                } else {
                    callback(displays);
                }
            });
        }

        public EnsureFileDownloaded(file: string, url: string, callback: () => void, error: () => void): void {
            this.EnsureDirectoryExists(this.GetDirName(file), () => {
                this.FileController.Exists(file, exists => {
                    if ( exists ) {
                        callback();
                    } else {
                        this.FileController.Download(file, url, success => {
                            if ( success ) {
                                callback();
                            } else {
                                error();
                            }
                        });
                    }
                });
            }, error);
        }

        public GetInstalledPackages(callback: (packages: { [name: string]: string }) => void): void {
            this.FileController.Read(this.RootDirectory + this.PathSeparator + "packages.config", contents => {
                if ( contents == null ) {
                    callback({});
                } else {
                    let doc = $.parseXML(contents);
                    let pkgs = doc.getElementsByTagName("package");
                    let packages: { [name: string]: string } = {};
                    for ( var i = 0; i < pkgs.length; ++i ) {
                        packages[pkgs[i].getAttribute("id")] = pkgs[i].getAttribute("version");
                    }
                    callback(packages);
                }
            });
        }

        public RecursiveDelete(dir: string, callback: (success: boolean) => void): void {
            this.DirectoryController.List(dir, (files, dirs) => {
                let iter = (i: number) => {
                    if ( i < files.length ) {
                        this.FileController.Delete(files[i], success => {
                            if ( success ) {
                                iter(i + 1);
                            } else {
                                callback(false);
                            }
                        });
                    } else {
                        let iter = (i: number) => {
                            if ( i < dirs.length ) {
                                this.RecursiveDelete(dirs[i], success => {
                                    if ( success ) {
                                        iter(i + 1);
                                    } else {
                                        callback(false);
                                    }
                                });
                            } else {
                                callback(true);
                            }
                        };
                        iter(0);
                    }
                };
                iter(0);
            });
        }

        public ToFileUri(path: string): string {
            if ( path[0] == '/' ) {
                return "file://" + path;
            } else {
                return "file:///" + path.replace(/\\/g, "/");
            }
        }

        public UpdateAll(callback: (success: boolean) => void): void {
            this.EnsureDirectoryExists(this.RootDirectory + this.PathSeparator + "update", () => {
                this.FileController.Write(this.RootDirectory + this.PathSeparator + "update" + this.PathSeparator + "Project.csproj", "", success => {
                    if ( success ) {
                        this.FileController.Download(this.RootDirectory + this.PathSeparator + "update" + this.PathSeparator + "packages.config", this.ToFileUri(this.RootDirectory + this.PathSeparator + "packages.config"), success => {
                            if ( success ) {
                                this.LaunchCLRProcess(this.RootDirectory + this.PathSeparator + "nuget.exe", "update packages.config -RepositoryPath ..", this.RootDirectory + this.PathSeparator + "update", proc => {
                                    proc.SetKilledCallback(() => {
                                        this.FileController.Download(this.RootDirectory + this.PathSeparator + "packages.config", this.ToFileUri(this.RootDirectory + this.PathSeparator + "update" + this.PathSeparator + "packages.config"), success => {
                                            if ( success ) {
                                                this.RecursiveDelete(this.RootDirectory + this.PathSeparator + "update", success => {
                                                    this.FileController.Delete(this.RootDirectory + this.PathSeparator + "repositories.config", success1 => {
                                                        callback(success && success1);
                                                    });
                                                });
                                            } else {
                                                this.RecursiveDelete(this.RootDirectory + this.PathSeparator + "update", () => callback(false));
                                            }
                                        });
                                    });
                                });
                            } else {
                                this.RecursiveDelete(this.RootDirectory + this.PathSeparator + "update", () => callback(false));
                            }
                        });
                    } else {
                        this.RecursiveDelete(this.RootDirectory + this.PathSeparator + "update", () => callback(false));
                    }
                });
            }, () => callback(false));
        }

        public InstallPackage(id: string, version: string, callback: (success: boolean) => void, log?: (line: string) => void): void {
            this.EnsureFileDownloaded(this.RootDirectory + this.PathSeparator + "nuget.exe", "https://nuget.org/nuget.exe", () => {
                this.LaunchCLRProcess(this.RootDirectory + this.PathSeparator + "nuget.exe", "install " + id + (version == null ? "" : " -version " + version), this.RootDirectory, proc => {
                    let newPkgs: any = {};
                    proc.SetReadCallback((stdout, stderr) => {
                        if ( stdout ) {
                            console.info(stdout);
                            let match = stdout.match(/Successfully installed '([A-Za-z0-9.]+) ([0-9.]+)'\./);
                            if ( match ) {
                                let pkgId: string = match[1];
                                let pkgVer: string = match[2];
                                newPkgs[pkgId] = pkgVer;
                            }
                            if ( log ) {
                                log(stdout);
                            }
                        }
                        if ( stderr ) {
                            console.error(stderr);
                            if ( log ) {
                                log(stderr);
                            }
                        }
                    });
                    proc.SetKilledCallback(() => {
                        proc.Kill(exitCode => {
                            if ( exitCode == 0 ) {
                                this.FileController.Read(this.RootDirectory + this.PathSeparator + "packages.config", contents => {
                                    let doc: XMLDocument = $.parseXML(contents ? contents : "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<packages></packages>");
                                    let pkgs = Object.getOwnPropertyNames(newPkgs);
                                    let elements = doc.getElementsByTagName("package");
                                    for ( var i = 0; i < pkgs.length; ++i ) {
                                        var found: boolean = false;
                                        for ( var j = 0; j < elements.length; ++j ) {
                                            if ( elements[j].getAttribute("id") == pkgs[i] ) {
                                                elements[j].setAttribute("version", newPkgs[pkgs[i]]);
                                                found = true;
                                                break;
                                            }
                                        }
                                        if ( !found ) {
                                            let element: Element = doc.createElement("package");
                                            element.setAttribute("id", pkgs[i]);
                                            element.setAttribute("version", newPkgs[pkgs[i]]);
                                            doc.documentElement.appendChild(element);
                                        }
                                    }
                                    this.FileController.Write(this.RootDirectory + this.PathSeparator + "packages.config", "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" + doc.documentElement.outerHTML, callback);
                                });
                            } else {
                                callback(false);
                            }
                        });
                    });
                });
            }, () => callback(false));
        }

        public IsBaseSystemInstalled(callback: (installed: boolean) => void): void {
            this.GetInstalledPackages(pkgs => callback(pkgs["Com.Latipium.Client"] != null && pkgs["Com.Latipium.Server"] != null));
        }

        public InstallBaseSystem(callback: (success: boolean) => void, log?: (line: string) => void): void {
            this.GetInstalledPackages(pkgs => {
                let step2 = (success: boolean) => {
                    if ( success ) {
                        let step3 = (success: boolean) => {
                            if ( success ) {
                                if ( pkgs["Com.Latipium.Defaults"] == null ) {
                                    this.InstallPackage("Com.Latipium.Defaults", null, callback, log);
                                } else {
                                    callback(true);
                                }
                            } else {
                                callback(false);
                            }
                        };
                        if ( pkgs["Com.Latipium.Server"] == null ) {
                            this.InstallPackage("Com.Latipium.Server", null, step3, log);
                        } else {
                            step3(true);
                        }
                    } else {
                        callback(false);
                    }
                };
                if ( pkgs["Com.Latipium.Client"] == null ) {
                    this.InstallPackage("Com.Latipium.Client", null, step2, log);
                } else {
                    step2(true);
                }
            });
        }

        public ReadDataFile(name: string, callback: (data: any) => void): void {
            this.FileController.Read(this.RootDirectory + this.PathSeparator + name + ".json", contents => {
                if ( contents == null ) {
                    callback(null);
                } else {
                    callback(JSON.parse(contents));
                }
            });
        }

        public WriteDataFile(name: string, data: any, callback: (success: boolean) => void): void {
            this.FileController.Write(this.RootDirectory + this.PathSeparator + name + ".json", JSON.stringify(data), callback);
        }

        public NetworkRequest(url: string, callback: (result: string) => void, body?: string) {
            if ( body ) {
                this.NetworkController.Post(url, body, callback);
            } else {
                this.NetworkController.Get(url, callback);
            }
        }

        private DetectCLR(callback: () => void): void {
            this.LaunchCLRProcess("--version", "", ".", proc => {
                if ( proc == null ) {
                    this.UseMono = false;
                    callback();
                } else {
                    proc.SetReadCallback((stdout, stderr) => {
                        if ( stdout ) {
                            console.info(stdout);
                        }
                        if ( stderr ) {
                            console.error(stderr);
                        }
                    });
                    proc.SetKilledCallback(() => {
                        proc.Kill(exitCode => {
                            this.UseMono = exitCode == 0;
                            callback();
                        });
                    });
                }
            }, env => env, () => true);
        }

        private FindRootDirectory(callback: () => void): void {
            this.EnvironmentController.GetOS(os => {
                if ( os == "windows" ) {
                    this.PathSeparator = "\\";
                } else {
                    this.PathSeparator = "/";
                }
                this.EnvironmentController.GetVariables(vars => {
                    if ( vars.LATIPIUM_DIR ) {
                        this.RootDirectory = vars.LATIPIUM_DIR;
                        callback();
                    } else {
                        this.EnvironmentController.GetFolders(folders => {
                            if ( folders.ApplicationData ) {
                                this.RootDirectory = folders.ApplicationData + this.PathSeparator + "latipium";
                            } else {
                                this.RootDirectory = vars.HOME + this.PathSeparator + ".latipium";
                            }
                            callback();
                        });
                    }
                });
            });
        }

        public constructor(init?: () => void, error?: () => void) {
            new LauncherFactoryFactory().GetFactory(factory => {
                if ( factory != null ) {
                    this.DirectoryController = factory.CreateDirectoryController();
                    this.EnvironmentController = factory.CreateEnvironmentController();
                    this.FileController = factory.CreateFileController();
                    this.ProcessController = factory.CreateProcessController();
                    this.NetworkController = factory.CreateNetworkController();
                    this.FindRootDirectory(() => this.DetectCLR(() => {
                        if ( init != null ) {
                            init();
                        }
                    }));
                } else if ( error != null ) {
                    error();
                }
            });
        }
    }
}
