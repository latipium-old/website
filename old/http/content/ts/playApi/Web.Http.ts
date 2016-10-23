namespace Com.Latipium.Launcher.Web.Http {
    import ApiEnvironmentModule = Com.Latipium.Website.Play.ApiEnvironmentModule;
    import ApiFilesystemModule = Com.Latipium.Website.Play.ApiFilesystemModule;
    import ApiInfo = Com.Latipium.Website.Play.ApiInfo;
    import ApiInfoModule = Com.Latipium.Website.Play.ApiInfoModule;
    import ApiNetworkModule = Com.Latipium.Website.Play.ApiNetworkModule;
    import ApiProcess = Com.Latipium.Website.Play.ApiProcess;
    import ApiProcessModule = Com.Latipium.Website.Play.ApiProcessModule;
    import PlayApi = Com.Latipium.Website.Play.PlayApi;

    class AbstractModule {
        private Root: string;

        protected Get(url: string, callback: (res: string) => void) {
            $.get(this.Root + url, callback).fail(() => callback(null));
        }

        protected GetBoolean(url: string, callback: (res: boolean) => void) {
            this.Get(url, str => {
                callback(str == "true" || str == "1");
            });
        }

        protected GetJSON(url: string, callback: (res: any) => void) {
            this.Get(url, str => {
                let obj: any;
                try {
                    obj = JSON.parse(str);
                } catch ( e ) {
                }
                callback(obj);
            });
        }

        protected Post(url: string, content: string, callback: (res: string) => void) {
            $.post(this.Root + url, content, callback).fail(() => callback(null));
        }

        protected PostBoolean(url: string, content: string, callback: (res: boolean) => void) {
            this.Post(url, content, str => {
                callback(str == "true" || str == "1");
            });
        }

        protected PostJSON(url: string, content: string, callback: (res: any) => void) {
            this.Post(url, content, str => {
                let obj: any;
                try {
                    obj = JSON.parse(str);
                } catch ( e ) {
                }
                callback(obj);
            });
        }

        public constructor(root: string) {
            this.Root = "http://localhost:43475" + root;
        }
    }

    class EnvironmentModule extends AbstractModule implements ApiEnvironmentModule {
        public GetVar(name: string, callback: (res: string) => void) {
            this.Get("/var/" + name, callback);
        }

        public IsUnix(callback: (res: boolean) => void) {
            this.GetBoolean("/unix", callback);
        }

        public constructor() {
            super("/env");
        }
    }

    class FilesystemModule extends AbstractModule implements ApiFilesystemModule {
        public Read(path: string, callback: (res: string) => void) {
            this.Get("/read/" + path, callback);
        }

        public Write(path: string, content: string, callback: (res: boolean) => void) {
            this.PostBoolean("/write/" + path, content, callback);
        }

        public Delete(path: string, callback: (res: boolean) => void) {
            this.GetBoolean("/rm/" + path, callback);
        }

        public List(path: string, callback: (res: string[]) => void) {
            this.GetJSON("/ls/" + path, callback);
        }

        public Exists(path: string, callback: (res: boolean) => void) {
            this.GetBoolean("/test/" + path, callback);
        }

        public constructor() {
            super("/fs");
        }
    }

    class InfoModule extends AbstractModule implements ApiInfoModule {
        public GetInfo(callback: (res: ApiInfo) => void) {
            this.GetJSON("/", callback);
        }

        public constructor() {
            super("/info");
        }
    }

    class NetworkModule extends AbstractModule implements ApiNetworkModule {
        public Download(url: string, path: string, callback: (res: boolean) => void) {
            this.PostBoolean("/dl/" + path, url, callback);
        }

        public constructor() {
            super("/net");
        }
    }

    class Process extends AbstractModule implements ApiProcess {
        private PID: number;
        public Read: (string) => void;

        public OnRead(listener: (string) => void) {
            this.Read = listener ? listener : () => {};
        }

        public Write(content: string, callback: (res: boolean) => void) {
            this.PostBoolean("/write/" + this.PID, content, callback);
        }

        public IsRunning(callback: (res: boolean) => void) {
            this.GetBoolean("/stat/" + this.PID, callback);
        }

        public constructor(pid: number) {
            super("/proc");
            this.PID = pid;
            this.OnRead(null);
        }
    }

    class ProcessModule extends AbstractModule implements ApiProcessModule {
        private CID: number;
        private procs: { [pid: number]: Process };

        public ReadIteration() {
            this.GetJSON("/read/" + this.CID, data => {
                if ( data.Read && data.Read.length ) {
                    for ( var i: number = 0; i < data.Read.length; ++i ) {
                        let pid: number = data.Read[i].Pid;
                        if ( this.procs[pid] ) {
                            this.procs[pid].Read(data.Read[i].Text);
                        }
                    }
                }
            });
        }

        public Spawn(path: string, cwd: string, args: string[], callback: (res: ApiProcess) => void) {
            this.PostJSON("/spawn", JSON.stringify({
                "Path": path,
                "Dir": cwd,
                "Args": args,
                "Cid": this.CID
            }), data => {
                if ( data ) {
                    this.CID = data[1];
                    let proc: Process = new Process(data[0]);
                    this.procs[data[0]] = proc;
                    callback(proc);
                } else {
                    callback(null);
                }
            });
        }

        public constructor() {
            super("/proc");
            this.CID = -1;
            this.procs = {};
        }
    }

    export class Api implements PlayApi {
        private Environment: EnvironmentModule;
        private Filesystem: FilesystemModule;
        private Info: InfoModule;
        private Network: NetworkModule;
        private Process: ProcessModule;
        private interval: number;

        public IsInstalled(callback: (res: boolean) => void) {
            this.Info.GetInfo(res => callback(res != null));
        }

        public GetWeight(callback: (res: number) => void) {
            callback(0);
        }

        public Activate() {
            this.interval = setInterval(() => this.Process.ReadIteration, 1000);
        }

        public Deactivate() {
            clearInterval(this.interval);
        }

        public GetEnvironment(callback: (res: ApiEnvironmentModule) => void) {
            callback(this.Environment);
        }

        public GetFilesystem(callback: (res: ApiFilesystemModule) => void) {
            callback(this.Filesystem);
        }
        
        public GetInfo(callback: (res: ApiInfoModule) => void) {
            callback(this.Info);
        }
        
        public GetNetwork(callback: (res: ApiNetworkModule) => void) {
            callback(this.Network);
        }
        
        public GetProcess(callback: (res: ApiProcessModule) => void) {
            callback(this.Process);
        }
        

        public constructor() {
            this.Environment = new EnvironmentModule();
            this.Filesystem = new FilesystemModule();
            this.Info = new InfoModule();
            this.Network = new NetworkModule();
            this.Process = new ProcessModule();
        }
    }
}
