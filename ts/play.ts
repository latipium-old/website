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
            new Angular("play");
        }
    }
}

namespace _ {
    import Setup = Com.Latipium.Website.Play.Setup;
    Setup.Main();
}
