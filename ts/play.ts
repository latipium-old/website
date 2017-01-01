namespace Com.Latipium.Website.Play {
    import _Angular = Com.Latipium.Website.Angular;
    import IScope = ng.IScope;
    import ITimeoutService = ng.ITimeoutService;
    import Launcher = Com.Latipium.Website.Play.Launcher.Launcher;
    import DisplayConfig = Com.Latipium.Website.Play.Launcher.DisplayConfig;

    class Log {
        public LastLine: string;
        public Full: string;
        public IsEmpty: boolean;
        private $apply: any;

        public Append(line: string): void {
            let apply = () => {
                this.LastLine = line;
                this.Full += line + "\n";
                this.IsEmpty = false;
            };
            if ( this.$apply ) {
                this.$apply(apply);
            } else {
                apply();
            }
        }

        public Clear(): void {
            let apply = () => {
                this.LastLine = "";
                this.Full = "";
                this.IsEmpty = true;
            };
            if ( this.$apply ) {
                this.$apply(apply);
            } else {
                apply();
            }
        }

        public constructor($apply?: any) {
            this.Append = this.Append.bind(this);
            this.Clear();
            this.$apply = $apply;
        }
    }

    class Mod {
        public Id: string;
        public Name: string;
        public Version: string;

        public loadFromNuGetApi(element: Element) {
            this.Id = element.getElementsByTagNameNS("http://schemas.microsoft.com/ado/2007/08/dataservices", "Id")[0].innerHTML;
            this.Name = element.getElementsByTagNameNS("http://schemas.microsoft.com/ado/2007/08/dataservices", "Title")[0].innerHTML;
            this.Version = element.getElementsByTagNameNS("http://schemas.microsoft.com/ado/2007/08/dataservices", "Version")[0].innerHTML;
        }

        public loadFromInstalledPackage(id: string, version: string, response: XMLDocument) {
            this.Id = id;
            this.Name = response.getElementsByTagNameNS("http://schemas.microsoft.com/ado/2007/08/dataservices", "Title")[0].innerHTML;
            this.Version = version;
        }
    }

    class Game {
        private Launcher: Launcher;
        private $apply;
        public Initialized: boolean;
        public DaemonRunning: boolean;
        public Installed: boolean;
        public HasErrored: boolean;
        public IsInstalling: boolean;
        public IsClientRunning: boolean;
        public InstallLog: Log;
        public ClientLog: Log;
        public LoadedInstalledModsPage: boolean;
        public LoadedRecommendedModsPage: boolean;
        public SearchLoading: boolean;
        public InstalledMods: Mod[];
        public RecommendedMods: Mod[];
        public SearchedMods: Mod[];
        public GraphicsSettings: DisplayConfig;

        public InstallBaseSystem(): void {
            this.IsInstalling = true;
            this.InstallLog.Clear();
            this.Launcher.InstallBaseSystem(success => {
                if ( success ) {
                    this.Launcher.UpdateAll(success => {
                        this.$apply(() => {
                            if ( success ) {
                                this.Installed = true;
                            } else {
                                this.HasErrored = true;
                            }
                            this.IsInstalling = false;
                        });
                    });
                } else {
                    this.$apply(() => {
                        this.HasErrored = true;
                        this.IsInstalling = false;
                    });
                }
            }, this.InstallLog.Append);
        }

        public ClearErrorState(): void {
            this.HasErrored = false;
        }

        public Launch(): void {
            this.IsClientRunning = true;
            let launch = (display: DisplayConfig) => {
                setTimeout(() => this.ClientLog.Clear(), 0);
                this.Launcher.Launch("SinglePlayer", display, (stdin: (stdin: string) => void) => {
                }, stdout => {
                    this.ClientLog.Append(stdout);
                }, stderr => {
                    this.ClientLog.Append(stderr);
                }, exitCode => {
                    this.IsClientRunning = false;
                });
            };
            if ( this.GraphicsSettings ) {
                launch(this.GraphicsSettings);
                this.GraphicsSettings = null;
            } else {
                this.Launcher.GetDisplays(display => {
                    let fields: string[] = display.GetFields();
                    for ( var i: number = 0; i < fields.length; ++i ) {
                        if ( display.GetOptions(fields[i]).length > 1 ) {
                            this.$apply(() => {
                                this.GraphicsSettings = display;
                                this.IsClientRunning = false;
                                setTimeout(() => $("select").material_select(), 0);
                            });
                            return;
                        }
                    }
                    launch(display);
                });
            }
        }

        public SearchMods(term: string): void {
            this.SearchLoading = true;
            this.SearchedMods = [];
            this.Launcher.NetworkRequest("https://www.nuget.org/api/v2/Search?searchTerm='" + term + "'&$filter=(substringof(' Latipium ', Tags) or startswith(Tags, 'Latipium ') or endswith(Tags, ' Latipium') or Tags eq 'Latipium') and IsLatestVersion", data => {
                let entries = $.parseXML(data).getElementsByTagNameNS("http://www.w3.org/2005/Atom", "entry");
                this.$apply(() => {
                    for ( var i: number = 0; i < entries.length; ++i ) {
                        let mod: Mod = new Mod();
                        mod.loadFromNuGetApi(entries[i]);
                        this.SearchedMods.push(mod);
                    }
                    this.SearchLoading = false;
                    setTimeout(() => $(".tooltipped").tooltip(), 0);
                });
            });
        }

        public IsInstalled(id: string): boolean {
            for ( var i: number = 0; i < this.InstalledMods.length; ++i ) {
                if ( this.InstalledMods[i].Id == id ) {
                    return true;
                }
            }
            return false;
        }

        public InstallPackage(id: string): void {
            this.IsInstalling = true;
            this.InstallLog.Clear();
            this.Launcher.InstallPackage(id, null, success => {
                this.$apply(() => {
                    this.IsInstalling = false;
                    this.HasErrored = !success;
                });
            }, this.InstallLog.Append);
        }

        public LoadInstallTab(): void {
            if ( !(this.LoadedInstalledModsPage && this.LoadedRecommendedModsPage) ) {
                this.LoadedInstalledModsPage = false;
                this.LoadedRecommendedModsPage = false;
                this.Launcher.GetInstalledPackages(packages => {
                    let packageIds = Object.getOwnPropertyNames(packages);
                    this.InstalledMods = [];
                    this.RecommendedMods = [];
                    var query: string = "https://www.nuget.org/api/v2/Packages?$filter=(substringof(' Latipium ', Tags) or startswith(Tags, 'Latipium ') or endswith(Tags, ' Latipium') or Tags eq 'Latipium') and IsLatestVersion and (not IsPrerelease) and not substringof(concat(concat(' ', Id), ' '), ' ";
                    for ( var i: number = 0; i < packageIds.length; ++i ) {
                        ((i: number) => {
                            this.Launcher.NetworkRequest("https://www.nuget.org/api/v2/FindPackagesById?id='" + packageIds[i] + "'&$filter=Version eq '" + packages[packageIds[i]] + "'", data => {
                                let response: XMLDocument = $.parseXML(data);
                                let mod: Mod = new Mod();
                                mod.loadFromInstalledPackage(packageIds[i], packages[packageIds[i]], response);
                                this.$apply(() => {
                                    this.InstalledMods.push(mod);
                                    if ( this.InstalledMods.length == packageIds.length ) {
                                        this.LoadedInstalledModsPage = true;
                                        setTimeout(() => $(".tooltipped").tooltip(), 0);
                                    }
                                });
                            });
                            query += packageIds[i] + " ";
                        })(i);
                    }
                    query += "')&$orderby=DownloadCount desc&$top=10";
                    this.Launcher.NetworkRequest(query, data => {
                        let entries = $.parseXML(data).getElementsByTagNameNS("http://www.w3.org/2005/Atom", "entry");
                        this.$apply(() => {
                            for ( var i: number = 0; i < entries.length; ++i ) {
                                let mod: Mod = new Mod();
                                mod.loadFromNuGetApi(entries[i]);
                                this.RecommendedMods.push(mod);
                            }
                            this.LoadedRecommendedModsPage = true;
                            setTimeout(() => $(".tooltipped").tooltip(), 0);
                        });
                    });
                });
            }
        }

        public constructor($apply) {
            this.$apply = $apply;
            this.HasErrored = false;
            this.IsInstalling = false;
            this.InstallLog = new Log($apply);
            this.ClientLog = new Log($apply);
            this.Launcher = new Launcher(() => {
                this.Launcher.ReadDataFile("worlds", data => {
                    if ( data != null ) {
                        $apply(() => Setup.Worlds.Deserialize(data));
                    }
                    let oldSave = Setup.Worlds.Save.bind(Setup.Worlds);
                    Setup.Worlds.Save = () => {
                        oldSave();
                        this.Launcher.WriteDataFile("worlds", Setup.Worlds.Serialize(), success => {
                            if ( !success ) {
                                console.error("Unable to save worlds file!");
                            }
                        });
                    };
                    this.Launcher.ReadDataFile("options", data => {
                        if ( data != null ) {
                            $apply(() => Setup.Options.Deserialize(data));
                        }
                        let oldSave = Setup.Options.Save.bind(Setup.Options);
                        Setup.Options.Save = () => {
                            oldSave();
                            this.Launcher.WriteDataFile("options", Setup.Options.Serialize(), success => {
                                if ( !success ) {
                                    console.error("Unable to save options file!");
                                }
                            });
                        };
                        this.Launcher.IsBaseSystemInstalled(installed => {
                            $apply(() => {
                                this.Initialized = true;
                                this.DaemonRunning = true;
                                this.Installed = installed;
                            });
                        });
                    });
                });
            }, () => {
                $apply(() => {
                    this.Initialized = true;
                    this.DaemonRunning = false;
                });
            });
        }
    }

    class Angular {
        public static timeout: ITimeoutService;
        public static scope: IScope;

        public Init($scope, $timeout) {
            $scope.worlds = Setup.Worlds;
            $scope.options = Setup.Options;
            $scope.Com = Com;
            $scope.game = Setup.Game = new Game($scope.$apply.bind($scope));
            $scope.openInstalledMods = () => {
                setTimeout(() => $(".play-frame .tabs.manageModsTabs").tabs("select_tab", "installedMods"), 0);
                Setup.Game.LoadInstallTab();
            };
            Angular.scope = $scope;
            Angular.timeout = $timeout;
        }

        public constructor(controller: string) {
            _Angular.Controller(controller, this.Init);
        }
    }

    export enum OptionType {
        Boolean,
        Number,
        String
    }

    class Option {
        public Id: string;
        public Name: string;
        public Description: string;
        public Type: OptionType;
        public Icon: string;
        public Value: number | string | boolean;
        public Visible: boolean;
        public Minimum: number;
        public Maximum: number;
        public Step: number;
        public List: OptionGroup;
        public Editing: boolean;

        public Edit(): void {
            if ( this.List ) {
                for ( var i: number = 0; i < this.List.length; ++i ) {
                    if ( this.List[i] != this ) {
                        this.List[i].Editing = false;
                    }
                }
            }
            Angular.timeout(() => {
                if ( this.List ) {
                    this.List.CurrentlyEditing = this;
                }
                this.Editing = true;
            }, 500);
        }

        public FinishEditing(): void {
            if ( this.List ) {
                this.List.CurrentlyEditing = null;
            }
            this.Editing = false;
        }

        public Serialize(): any {
            let obj: any = {
                "Id": this.Id,
                "Name": this.Name,
                "Desc": this.Description,
                "Value": this.Value,
                "Visible": this.Visible
            };
            if ( this.Icon ) {
                obj.Icon = this.Icon;
            }
            switch ( this.Type ) {
                case OptionType.Number:
                    obj.Min = this.Minimum;
                    obj.Max = this.Maximum;
                    obj.Step = this.Step;
                    obj.Type = "Number";
                    break;
                case OptionType.Boolean:
                    obj.Type = "Boolean";
                    break;
                default:
                    obj.Type = "String";
                    break;
            }
            return obj;
        }

        public static Deserialize(obj: any): Option {
            let type: OptionType;
            switch ( obj.Type ) {
                case "Boolean":
                    type = OptionType.Boolean;
                    break;
                case "Number":
                    type = OptionType.Number;
                    break;
                default:
                    type = OptionType.String;
                    break;
            }
            return new Option(obj.Id, obj.Name, obj.Desc, type, obj.Icon, obj.Value, obj.Visible, obj.Min, obj.Max, obj.Step);
        }

        public constructor(id: string, name: string, description: string, type: OptionType, icon: string, value: number | string | boolean, visible: boolean, minumum: number, maximum: number, step: number) {
            this.Id = id;
            this.Name = name;
            this.Description = description;
            this.Type = type;
            this.Icon = icon;
            this.Value = value;
            this.Visible = visible;
            this.Minimum = minumum;
            this.Maximum = maximum;
            this.Step = step;
        }
    }

    class OptionGroup extends Array<Option> {
        public Id: string;
        public Name: string;
        public Description: string;
        public Icon: string;
        public Editing: boolean;
        public List: OptionList;
        public CurrentlyEditing: Option;

        public Edit(): void {
            if ( this.List ) {
                for ( var i: number = 0; i < this.List.length; ++i ) {
                    this.List[i].Editing = false;
                }
                this.List.CurrentlyEditing = this;
            }
            this.Editing = true;
        }

        public FinishEditing(): void {
            if ( this.List ) {
                this.List.CurrentlyEditing = null;
                this.List.Save();
            }
            this.Editing = false;
        }

        public push(...options: Option[]): number {
            for ( var i: number = 0; i < options.length; ++i ) {
                options[i].List = this;
                super.push(options[i]);
            }
            if ( this.List ) {
                this.List.Save();
            }
            return this.length;
        }

        public Serialize(): any {
            let obj: any = {
                "Id": this.Id,
                "Name": this.Name,
                "Desc": this.Description,
                "Options": []
            };
            if ( this.Icon ) {
                obj.Icon = this.Icon;
            }
            for ( var i: number = 0; i < this.length; ++i ) {
                obj.Options.push(this[i].Serialize());
            }
            return obj;
        }

        public static Deserialize(obj: any): OptionGroup {
            let group: OptionGroup = new OptionGroup(obj.Id, obj.Name, obj.Desc, obj.Icon);
            for ( var i: number = 0; i < obj.Options.length; ++i ) {
                group.push(Option.Deserialize(obj.Options[i]));
            }
            return group;
        }

        public constructor(id: string, name: string, description: string, icon: string) {
            super();
            this.Id = id;
            this.Name = name;
            this.Description = description;
            this.Icon = icon;
        }
    }

    class OptionList extends Array<OptionGroup> {
        public CurrentlyEditing: OptionGroup;

        public AnyEditing(): any {
            for ( var i: number = 0; i < this.length; ++i ) {
                if ( this[i].Editing ) {
                    return true;
                }
            }
            return false;
        }

        public push(...options: OptionGroup[]): number {
            for ( var i: number = 0; i < options.length; ++i ) {
                options[i].List = this;
                super.push(options[i]);
            }
            this.Save();
            return this.length;
        }

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
                this.push(OptionGroup.Deserialize(obj[i]));
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

        public static RemoteWorld(): World {
            return new World("New Server", false, "localhost", 43476);
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

        public Delete(): void {
            if ( this.List != null ) {
                Angular.timeout(() => {
                    this.List.splice(this.List.indexOf(this), 1);
                    this.List.SelectIndex(-1);
                    this.List.Save();
                }, 500);
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

    class WorldList extends Array<World> {
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
            setTimeout(() => ($("select") as any).material_select(), 0);
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
        public static Game: Game;

        public static Main(): void {
            Setup.Worlds = new WorldList();
            Setup.Options = new OptionList();
            new Angular("play");
        }
    }
}

namespace _ {
    import Setup = Com.Latipium.Website.Play.Setup;
    Setup.Main();
}
