namespace Com.Latipium.Website.Play.Infinite {
    export class InfiniteScript {
        private Element: HTMLScriptElement;

        public Load() {
            let element: HTMLScriptElement = this.Element = document.createElement("script");
            element.src = "//raw.githubusercontent.com/tobiasahlin/infinite-jekyll/master/js/infinite-jekyll.js";
            document.head.appendChild(element);
        }

        public Unload() {
            document.head.removeChild(this.Element);
        }

        public IsLoaded(): boolean {
            return this.Element != null;
        }

        public constructor() {
            this.Element = null;
        }
    }

    export class Setup {
        private static Script: InfiniteScript;

        public static Main(): void {
            Setup.Script = new InfiniteScript();
            $(window).on("turbolinks:load", () => {
                if ( Setup.Script.IsLoaded() ) {
                    Setup.Script.Unload();
                }
                setTimeout(Setup.Script.Load(), 0);
            });
        }
    }
}

namespace _ {
    import Setup = Com.Latipium.Website.Play.Infinite.Setup;
    Setup.Main();
}
