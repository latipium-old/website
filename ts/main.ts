namespace Com.Latipium.Website {
    import IDirectiveFactory = ng.IDirectiveFactory;
    import IModule = ng.IModule;

    export class Angular {
        public static app: IModule;
        private static controllers: { [name: string]: Function } = {};
        private static directives: { [name: string]: IDirectiveFactory } = {};

        public static Controller(name: string, func: Function) {
            Angular.controllers[name] = func;
        }

        public static Directive(name: string, func: IDirectiveFactory) {
            Angular.directives[name] = func;
        }

        public static Init() {
            if ( !Angular.app ) {
                Angular.app = angular.module("latipium", []);
            }
            let directives: string[] = Object.keys(Angular.directives);
            for ( var i: number = 0; i < directives.length; ++i ) {
                let key: string = directives[i];
                let value: IDirectiveFactory = Angular.directives[key];
                if ( key && value ) {
                    Angular.app.directive(key, value);
                }
            }
            Angular.directives = {};
            let controllers: string[] = Object.keys(Angular.controllers);
            for ( var i: number = 0; i < controllers.length; ++i ) {
                let key: string = controllers[i];
                let value: Function = Angular.controllers[key];
                if ( key && value ) {
                    Angular.app.controller(key, value);
                }
            }
            Angular.controllers = {};
            angular.bootstrap($(".angular-wrapper"), [
                "latipium"
            ]);
        }
    }

    export class Apis {
        public static Version: number = 1;

        public static Call(callback: (any) => void, endpoint: string, data: { [key: string]: string }) {
            if ( callback ) {
                $.get({
                    "cache": false,
                    "data": data,
                    "dataType": "json",
                    "error": (xhr, status, error) => callback({
                        "error": true,
                        "success": false,
                        "xhr": xhr,
                        "status": status,
                        "message": error
                    }),
                    "success": (data, status, xhr) => callback({
                        "error": false,
                        "success": true,
                        "xhr": xhr,
                        "status": status,
                        "data": data
                    }),
                    "url": "https://latipium.ourproject.org/v" + Apis.Version + "/" + endpoint,
                    "xhrFields": {
                        "withCredentials": true
                    }
                });
            } else {
                var props = Object.getOwnPropertyNames(data);
                var query = [];
                for ( var i = 0; i < props.length; ++i ) {
                    query.push(encodeURIComponent(props[i]) + "=" + encodeURIComponent(data[props[i]]));
                }
                location.href = "https://latipium.ourproject.org/v" + Apis.Version + "/" + endpoint + (query.length > 0 ? "?" + query.join("&") : "");
            }
        }
    }

    export class Authentication {
        public static Login() {
            Apis.Call(null, "redirect", {
                "url": sessionStorage.getItem("referer")
            });
        }

        public static Logout() {
            // TODO
        }
    }

    export class HeaderController {
        public constructor() {
            Angular.Controller("header", $scope => Apis.Call(res => $scope.$apply(() => {
                $scope.name = res.success ? res.data.name : null;
                $scope.authenticated = res.success;
            }), "id", {}));
        }
    }

    export class Setup {
        public static Main(): void {
            $(window).on("turbolinks:load", () => {
                ($(".side-nav-activate") as any).sideNav();
                ($(".collapsible") as any).collapsible({
                    accordion: false
                });
                ($("select") as any).material_select();
                $(".startup-click").trigger("click");
                Angular.Init();
                sessionStorage.setItem("referer", location.href);
            });
            new HeaderController();
        }
    }
}

namespace _ {
    import Setup = Com.Latipium.Website.Setup;
    Setup.Main();
    window["Com"] = Com;
}
