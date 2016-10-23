namespace Com.Latipium.Website.Play {
    import _Angular = Com.Latipium.Website.Angular;
    import IScope = ng.IScope;
    import ITimeoutService = ng.ITimeoutService;

    export class Angular {
        public static timeout: ITimeoutService;
        public static scope: IScope;

        public Init($scope, $timeout) {
            $scope.worlds = Setup.Worlds;
            $scope.options = Setup.Options;
            $scope.Com = Com;
            Angular.scope = $scope;
            Angular.timeout = $timeout;
        }

        public constructor(controller: string) {
            _Angular.Controller(controller, this.Init);
        }
    }

    export interface ApiEnvironmentModule {
        GetVar(name: string, callback: (res: string) => void): void;
        IsUnix(callback: (res: boolean) => void): void;
    }

    export interface ApiFilesystemModule {
        Read(path: string, callback: (res: string) => void): void;
        Write(path: string, content: string, callback: (res: boolean) => void): void;
        Delete(path: string, callback: (res: boolean) => void): void;
        List(path: string, callback: (res: string[]) => void): void;
        Exists(path: string, callback: (res: boolean) => void): void;
    }

    export class ApiInfo {
        public Version: string;
    }

    export interface ApiInfoModule {
        GetInfo(callback: (res: ApiInfo) => void): void;
    }

    export interface ApiNetworkModule {
        Download(url: string, path: string, callback: (res: boolean) => void): void;
    }

    export interface ApiProcess {
        OnRead(listener: (string) => void): void;
        Write(content: string, callback: (res: boolean) => void): void;
        IsRunning(callback: (res: boolean) => void): void;
    }

    export interface ApiProcessModule {
        Spawn(path: string, cwd: string, args: string[], callback: (res: ApiProcess) => void): void;
    }

    export interface PlayApi {
        IsInstalled(callback: (res: boolean) => void): void;
        GetWeight(callback: (res: number) => void): void;
        Activate(): void;
        Deactivate(): void;

        GetEnvironment(callback: (res: ApiEnvironmentModule) => void): void;
        GetFilesystem(callback: (res: ApiFilesystemModule) => void): void;
        GetInfo(callback: (res: ApiInfoModule) => void): void;
        GetNetwork(callback: (res: ApiNetworkModule) => void): void;
        GetProcess(callback: (res: ApiProcessModule) => void): void;
    }

    export class PlayApiFactory {
        private static Impls: PlayApi[];
        private static ActiveApi: PlayApi;
        private static SuggestedApi: PlayApi;
        private static SuggestedWeight: number;

        public static GetSuggestedApi(callback: (res: PlayApi) => void) {
            if ( PlayApiFactory.ActiveApi ) {
                callback(PlayApiFactory.ActiveApi);
            } else if ( PlayApiFactory.SuggestedApi ) {
                callback(PlayApiFactory.SuggestedApi);
            } else {
                this.GetApi(() => callback(PlayApiFactory.SuggestedApi));
            }
        }

        public static GetApi(callback: (res: PlayApi) => void) {
            if ( PlayApiFactory.ActiveApi ) {
                callback(PlayApiFactory.ActiveApi);
            } else {
                var i: number = 0;
                let loop: (res: boolean) => void = success => {
                    let impl: PlayApi = PlayApiFactory.Impls[i];
                    if ( success ) {
                        PlayApiFactory.ActiveApi = impl;
                        PlayApiFactory.SuggestedWeight = Number.MAX_VALUE;
                        PlayApiFactory.SuggestedApi = null;
                        callback(impl);
                    } else {
                        impl.GetWeight(weight => {
                            if ( weight > PlayApiFactory.SuggestedWeight ) {
                                PlayApiFactory.SuggestedWeight = weight;
                                PlayApiFactory.SuggestedApi = impl;
                            }
                        });
                        if ( PlayApiFactory.Impls.length > ++i ) {
                            impl.IsInstalled(loop);
                        } else {
                            callback(null);
                        }
                    }
                };
                if ( PlayApiFactory.Impls.length > 0 ) {
                    PlayApiFactory.Impls[0].IsInstalled(loop);
                }
            }
        }

        public static Init() {
            PlayApiFactory.Impls = [];
            PlayApiFactory.SuggestedWeight = Number.MIN_VALUE;
            $.getJSON("/play/apiPlatforms.json", data => {
                for ( var i: number = 0; i < data.length; ++i ) {
                    let desc: any = data[i];
                    $.getScript(desc.FileName, () => {
                        PlayApiFactory.Impls.push(new (eval(desc.Namespace + "." + desc.MainClass))());
                    });
                }
            });
        }
    }

    export class Game {
        public Api: PlayApi;
        public Environment: ApiEnvironmentModule;
        public Filesystem: ApiFilesystemModule;
        public Network: ApiNetworkModule;
        public Process: ApiProcessModule;
        public RootDir: string;
        public UseMono: boolean;
        public Loaded: boolean;

        private Fail(message: string) {
            // TODO
            console.error(message);
        }

        private Load_Finish(mono: boolean) {
            this.UseMono = mono;
            this.Loaded = true;
        }

        private Load_TestCLR() {
            this.Process.Spawn("mono", this.RootDir, [
                "nuget.exe",
                "help"
            ], proc => {
                if ( proc ) {
                    this.Load_Finish(true);
                } else {
                    this.Process.Spawn(this.RootDir + "/nuget.exe", this.RootDir, [
                        "help"
                    ], proc => {
                        if ( proc ) {
                            this.Load_Finish(false);
                        } else {
                            this.Fail("CLR not found or does not work");
                        }
                    });
                }
            });
        }

        private Load_SetRoot(root: string) {
            this.RootDir = root;
            this.Filesystem.Exists(root + "/nuget.exe", exists => {
                if ( exists ) {
                    this.Load_TestCLR();
                } else {
                    this.Network.Download("https://nuget.org/nuget.exe", root + "/nuget.exe", success => {
                        if ( success ) {
                            this.Load_TestCLR();
                        } else {
                            this.Fail("Unable to install nuget");
                        }
                    });
                }
            });
        }

        public Load() {
            PlayApiFactory.GetApi(api => {
                if ( api ) {
                    this.Api = api;
                    this.Api.GetEnvironment(api => {
                        this.Environment = api;
                        this.Api.GetFilesystem(api => {
                            this.Filesystem = api;
                            this.Api.GetNetwork(api => {
                                this.Network = api;
                                this.Api.GetProcess(api => {
                                    this.Process = api;
                                    this.Environment.IsUnix(unix => {
                                        if ( unix ) {
                                            this.Environment.GetVar("HOME", home => this.Filesystem.Exists(home + "/Library/Application Support/", mac => {
                                                this.Load_SetRoot(home + (mac ? "/Library/Application Support/latipium" : "/.latipium"));
                                            }));
                                        } else {
                                            this.Environment.GetVar("APPDATA", appdata => this.Load_SetRoot(appdata.replace('\\', '/') + "/latipium"));
                                        }
                                    });
                                });
                            });
                        });
                    })
                } else {
                    PlayApiFactory.GetSuggestedApi(api => {
                        this.Fail("No platforms are installed");
                    });
                }
            });
        }

        public constructor() {
            setTimeout(() => this.Load(), 5000);
        }
    }

    export class OptionController {
        public static RowClick(ev: Event) {
            let e: Event = ev || window.event;
            if ( !(e as any).optionHelp ) {
                e.stopPropagation();
                e.cancelBubble = true;
            }
        }

        public static HelpClick(ev: Event) {
            let e: Event = ev || window.event;
            (e as any).optionHelp = true;
        }

        public static Back() {
            Setup.Options.Save();
            history.back();
        }
    }

    export class Option {
        public Id: string;
        public Name: string;
        public Value: string;
        public Type: string;
        public Description: string;
        public Parent: string;

        public Serialize(): any {
            return {
                "Id": this.Id,
                "Name": this.Name,
                "Value": this.Value,
                "Type": this.Type,
                "Description": this.Description,
                "Parent": this.Parent
            };
        }

        public static Deserialize(obj: any): Option {
            return new Option(obj.Id, obj.Name, obj.Value, obj.Type, obj.Description, obj.Parent);
        }

        public constructor(id: string, name: string, value: string, type: string, desc: string, parent: string | Option) {
            this.Id = id;
            this.Name = name;
            this.Value = value;
            this.Type = type;
            this.Description = desc;
            this.Parent = parent == null ? null : typeof parent == "string" ? parent as string : (parent as Option).Id;
        }
    }

    export class OptionList extends Array<Option> {
        public Serialize(): any {
            let o: any[] = [];
            for ( var i: number = 0; i < this.length; ++i ) {
                o[i] = this[i].Serialize();
            }
            return o;
        }

        public Deserialize(obj: any) {
            this.splice(0);
            for ( var i: number = 0; i < obj.length; ++i ) {
                this.push(Option.Deserialize(obj[i]));
            }
        }

        public Save() {
            localStorage.setItem("options", JSON.stringify(this.Serialize()));
        }

        public constructor() {
            super();
            try {
                this.Deserialize(JSON.parse(localStorage.getItem("options")));
            } catch ( e ) {
                this.push(new Option("Com.Latipium.Website.Play.Options.None", "There are no options!", null, null, "You have to launch the game before options will appear", null));
            }
        }
    }

    enum WorldEditingElement {
        None,
        Name,
        Location
    }

    export class World {
        private static Ids: number[] = [];
        public Name: string;
        public Local: boolean;
        public Location: string;
        public Port: number;
        public List: WorldList;
        private Editing: WorldEditingElement;

        public Serialize(): any {
            return {
                "Name": this.Name,
                "Local": this.Local,
                "Location": this.Location,
                "Port": this.Port
            };
        }

        public static Deserialize(obj: any, list: WorldList): World {
            let w: World = new World(obj.Name, obj.Local, obj.Location, obj.Port);
            w.List = list;
            return w;
        }

        public static SerializeClass(): any {
            return World.Ids;
        }

        public static DeserializeClass(obj: any) {
            World.Ids = obj;
        }

        public static RandomWorld(): World {
            var id;
            do {
                id = Math.floor(Math.random() * 1000000);
            } while ( World.Ids.indexOf(id) >= 0 );
            World.Ids.push(id);
            return new World("New World", true, "world-" + id, 43476);
        }

        public IsSelected(): boolean {
            if ( this.List == null ) {
                return false;
            } else {
                return this.List.IsSelected(this);
            }
        }

        public Select(): void {
            if ( this.List != null ) {
                let old = this.List.GetSelected();
                if ( old != this ) {
                    if ( old != null ) {
                        old.StopEditing();
                    }
                    this.List.Select(this);
                }
            }
        }

        public EditName(): void {
            this.Select();
            this.Editing = WorldEditingElement.Name;
        }

        public IsEditingName(): boolean {
            return this.Editing == WorldEditingElement.Name;
        }

        public EditLocation(): void {
            this.Select();
            this.Editing = WorldEditingElement.Location;
        }

        public IsEditingLocation(): boolean {
            return this.Editing == WorldEditingElement.Location;
        }

        public StopEditing(): void {
            this.Editing = WorldEditingElement.None;
            if ( this.List != null ) {
                this.List.Save();
            }
        }

        public constructor(name: string, local: boolean, location: string, port: number) {
            this.Name = name;
            this.Local = local;
            this.Location = location;
            this.Port = port;
            this.List = null;
            this.StopEditing();
        }
    };

    export class WorldList extends Array<World> {
        private Selected: number;

        public Serialize(): any {
            let o: any[] = [];
            for ( var i: number = 0; i < this.length; ++i ) {
                o[i] = this[i].Serialize();
            }
            return {
                "Worlds": o,
                "Class": WorldList.SerializeClass()
            };
        }

        public Deserialize(obj: any) {
            this.splice(0);
            for ( var i: number = 0; i < obj.Worlds.length; ++i ) {
                super.push(World.Deserialize(obj.Worlds[i], this));
            }
            WorldList.DeserializeClass(obj.Class);
        }

        public static SerializeClass(): any {
            return {
                "World": World.SerializeClass()
            };
        }

        public static DeserializeClass(obj: any) {
            World.DeserializeClass(obj.World);
        }

        public Save() {
            localStorage.setItem("worlds", JSON.stringify(this.Serialize()));
        }

        public push(...worlds: World[]): number {
            for ( var i: number = 0; i < worlds.length; ++i ) {
                worlds[i].List = this;
                super.push(worlds[i]);
            }
            this.Save();
            return this.length;
        }

        public IsSelected(world: World): boolean {
            return this.AnySelected() && this.indexOf(world) == this.Selected;
        }

        public AnySelected(): boolean {
            return this.Selected >= 0 && this.Selected < this.length;
        }

        public GetSelected(): World {
            return this.AnySelected() ? this[this.Selected] : null;
        }

        public SelectIndex(index: number): void {
            this.Selected = index;
        }

        public Select(world: World): void {
            Angular.timeout(() => this.SelectIndex(this.indexOf(world)), 500);
        }

        public constructor() {
            super();
            this.Selected = -1;
            try {
                this.Deserialize(JSON.parse(localStorage.getItem("worlds")));
            } catch ( e ) {
                this.push(World.RandomWorld());
            }
        }
    };

    export class Setup {
        public static Worlds: WorldList;
        public static Options: OptionList;

        public static Main(): void {
            Setup.Worlds = new WorldList();
            Setup.Options = new OptionList();
            PlayApiFactory.Init();
            new Angular("play");
        }
    }
}

namespace _ {
    import Setup = Com.Latipium.Website.Play.Setup;
    Setup.Main();
}
