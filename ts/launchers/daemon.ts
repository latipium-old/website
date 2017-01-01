namespace Com.Latipium.Website.Play.Launcher.Daemon {
    class BaseController {
        private static UriRoot = localStorage.getItem("DaemonUri") || "http://localhost:43475/";
        private Uri: string;

        protected Request(method: string, argument: any, body: string, success: (data: any) => void, error: () => void): void {
            $.ajax({
                "accepts": {
                    "json": "application/json"
                },
                "cache": false,
                "contentType": "application/json",
                "data": body,
                "dataType": "json",
                "error": error,
                "jsonp": false,
                "method": method,
                "success": success,
                "url": argument == null ? this.Uri : this.Uri + encodeURIComponent(argument).replace(/%/g, "!")
            });
        }

        constructor(endpoint: string) {
            this.Uri = BaseController.UriRoot + endpoint + "/";
        }
    }

    class DirectoryController extends BaseController implements IDirectoryController {
        public Exists(dir: string, callback: (exists: boolean) => void): void {
            this.Request("GET", dir, null, data => callback(data.Exists), () => callback(false));
        }

        public List(dir: string, callback: (files: string[], dirs: string[]) => void): void {
            this.Request("GET", dir, null, data => callback(data.Files, data.Directories), () => callback([], []));
        }

        public Mkdir(dir: string, callback: (success: boolean) => void): void {
            this.Request("PUT", dir, null, data => callback(data.Exists), () => callback(false));
        }

        public Rmdir(dir: string, callback: (success: boolean) => void): void {
            this.Request("DELETE", dir, null, data => callback(!data.Exists), () => callback(false));
        }

        public constructor() {
            super("directory");
        }
    }

    class EnvironmentController extends BaseController implements IEnvironmentController {
        private Data: any;

        private EnsureData(callback: () => void, error: () => void): void {
            if ( this.Data == null ) {
                this.Request("GET", null, null, data => {
                    this.Data = data;
                    callback();
                }, error);
            } else {
                callback();
            }
        }

        public GetOS(callback: (os: string) => void): void {
            this.EnsureData(() => callback(this.Data.OS), () => callback(null));
        }

        public GetArch(callback: (is64: boolean) => void): void {
            this.EnsureData(() => callback(this.Data.Is64Bit), () => callback(false));
        }

        public GetVariables(callback: (vars: any) => void): void {
            this.EnsureData(() => callback(this.Data.Variables), () => callback({}));
        }

        public GetFolders(callback: (folders: any) => void): void {
            this.EnsureData(() => callback(this.Data.SpecialFolders), () => callback({}));
        }

        public constructor() {
            super("environment");
        }
    }

    class FileController extends BaseController implements IFileController {
        public Exists(file: string, callback: (exists: boolean) => void): void {
            this.Request("GET", file, "empty", data => callback(data.Exists), () => callback(false));
        }

        public Read(file: string, callback: (contents: string) => void): void {
            this.Request("GET", file, null, data => callback(data.Contents), () => callback(null));
        }

        public Write(file: string, contents: string, callback: (success: boolean) => void): void {
            this.Request("PUT", file, contents, data => callback(data.Exists), () => callback(false));
        }

        public Download(file: string, url: string, callback: (success: boolean) => void): void {
            this.Request("POST", file, url, data => callback(data.Exists), () => callback(false));
        }

        public Delete(file: string, callback: (success: boolean) => void): void {
            this.Request("DELETE", file, null, data => callback(!data.Exists), () => callback(false));
        }

        public constructor() {
            super("file");
        }
    }

    class Process extends BaseController implements IProcess {
        private Id: number;
        private ReadCallback: (stdout: string, stderr: string) => void;
        private KilledCallback: () => void;
        private PollInterval: number;
        private DeathNotified: boolean;
        private ExitCode: number;

        public ProcessResponse(data: any): void {
            if ( (data.StdOut || data.StdErr) && this.ReadCallback ) {
                this.ReadCallback(data.StdOut, data.StdErr);
            }
            if ( !data.IsRunning ) {
                if ( data.ExitCode != -65536 ) {
                    this.ExitCode = data.ExitCode;
                    if ( (data.StdOut || data.StdErr) && this.ReadCallback ) {
                        this.SendRequest("GET", null, data => this.ProcessResponse(data), () => {});
                        return;
                    }
                }
                this.PollInterval = -1;
                if ( this.KilledCallback && !this.DeathNotified ) {
                    this.DeathNotified = true;
                    this.KilledCallback();
                }
            }
        }

        private SendRequest(method: string, body: string, callback: (data: any) => void, error: () => void): void {
            this.Request(method, this.Id, body, data => {
                this.ProcessResponse(data);
                callback(data);
            }, error);
        }

        private Poll(): void {
            let callback: () => void = () => this.PollInterval > 0 ? setTimeout(() => this.Poll(), this.PollInterval) : null;
            this.SendRequest("GET", null, callback, callback);
        }

        public SetReadCallback(callback: (stdout: string, stderr: string) => void): void {
            this.ReadCallback = callback;
        }

        public SetKilledCallback(callback: () => void): void {
            this.KilledCallback = callback;
        }

        public SetPollInterval(interval: number): void {
            this.PollInterval = interval;
        }

        public Send(stdin: string, callback: (success: boolean) => void): void {
            this.SendRequest("POST", stdin, data => callback(data.IsRunning), () => callback(false));
        }

        public Kill(callback: (exitCode: number) => void): void {
            this.SendRequest("DELETE", null, () => callback(this.ExitCode), () => callback(-65538));
        }

        public constructor(id: number) {
            super("process");
            this.Id = id;
            this.PollInterval = 10;
            this.Poll();
            this.DeathNotified = false;
            this.ExitCode = -65538;
        }
    }

    class ProcessController extends BaseController implements IProcessController {
        private CreateId(callback: (id: number) => void) {
            let id: number = Math.floor(1000000 * Math.random());
            this.Request("GET", id, null, data => {
                if ( data.IsRunning ) {
                    this.CreateId(callback);
                } else {
                    callback(id);
                }
            }, () => callback(id));
        }

        public List(callback: (procs: IProcess[]) => void): void {
            this.Request("GET", null, null, callback, () => callback([]));
        }

        public Spawn(exe: string, args: string, dir: string, env: any, callback: (proc: IProcess) => void): void {
            this.CreateId(id => this.Request("PUT", id, JSON.stringify({
                "Arguments": args,
                "EnvironmentalVariables": env,
                "FileName": exe,
                "WorkingDirectory": dir
            }), data => {
                let proc = new Process(id);
                setTimeout(() => {
                    proc.ProcessResponse(data);
                }, 0);
                callback(proc);
            }, () => callback(null)));
        }

        public constructor() {
            super("process");
        }
    }

    class NetworkController extends BaseController implements INetworkController {
        public Get(url: string, callback: (result: string) => void): void {
            this.Request("GET", url, null, callback, () => callback(null));
        }

        public Post(url: string, data: string, callback: (result: string) => void): void {
            this.Request("POST", url, data, callback, () => callback(null));
        }

        public constructor() {
            super("network");
        }
    }

    export class DaemonFactory extends BaseController implements ILauncherFactory {
        public IsRunning(callback: (running: boolean) => void): void {
            this.Request("GET", null, null, data => callback(true), () => callback(false));
        }

        public CreateDirectoryController(): IDirectoryController {
            return new DirectoryController();
        }

        public CreateEnvironmentController(): IEnvironmentController {
            return new EnvironmentController();
        }

        public CreateFileController(): IFileController {
            return new FileController();
        }

        public CreateProcessController(): IProcessController {
            return new ProcessController();
        }

        public CreateNetworkController(): INetworkController {
            return new NetworkController();
        }

        public constructor() {
            super("version");
        }
    }
}
