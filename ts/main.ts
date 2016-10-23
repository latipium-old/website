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

    export class ApiQuery {
        public type: string;
        public data: string;
    }

    export class ApiRequest {
        public version: number;
        public session: boolean;
        public queries: ApiQuery[];
    }

    export class ApiResponse {
        public successful_queries: ApiQuery[];
        public failed_queries: ApiQuery[];
        public query_results: any[];
    }

    export class Apis {
        private static SessionToken: string;
        public static Version: number = 1;

        public static Call(callback: (ApiResponse) => void, req?: ApiRequest | ApiQuery, ...reqs: ApiQuery[]) {
            let _req: ApiRequest;
            if ( req ) {
                if ( req.hasOwnProperty("type") && req.hasOwnProperty("data") ) {
                    reqs = reqs || [];
                    reqs.push(req as ApiQuery);
                    _req = new ApiRequest();
                    _req.version = 1;
                    _req.session = true;
                } else {
                    _req = req as ApiRequest;
                }
            } else {
                _req = new ApiRequest();
                _req.version = 1;
                _req.session = true;
            }
            if ( reqs && reqs.length > 0 ) {
                _req.queries = reqs;
            } else if ( !_req.queries ) {
                _req.queries = [];
            }
            if ( _req.session ) {
                $.post("https://apis.latipium.com/init", JSON.stringify(_req), (data: any) => {
                    $.get("https://apis.latipium.com/session/" + Apis.SessionToken + "?state=" + data, (data: any) => {
                        if ( typeof(data) == "string" ) {
                            let obj: any = data;
                            try {
                                obj = JSON.parse(data as string);
                            } catch ( e ) {
                            }
                            callback(obj);
                        } else {
                            callback(data);
                        }
                    });
                });
            } else {
                let form: HTMLFormElement = document.createElement("form");
                form.hidden = true;
                form.method = "POST";
                form.action = "https://apis.latipium.com/init";
                let input: HTMLInputElement = document.createElement("input");
                input.type = "hidden";
                input.name = "_";
                input.value = JSON.stringify(_req);
                form.appendChild(input);
                document.body.appendChild(form);
                setTimeout(() => form.submit(), 0);
            }
        }

        public static PopCookie(name: string, doc: HTMLDocument = document): ApiResponse {
            let val: string;
            let cookies: string[] = doc.cookie.split(';');
            for ( var i: number = 0; i < cookies.length; ++i ) {
                let cookie: string[] = cookies[i].trim().split('=', 2);
                if ( cookie[0] == name ) {
                    val = cookie[1];
                    break;
                }
            }
            doc.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
            return val ? JSON.parse(val) : null;
        }

        public static Init() {
            Apis.SessionToken = localStorage.getItem("authSession");
        }
    }

    export class Authentication {
        public static Login() {
            localStorage.setItem("authReturn", sessionStorage.getItem("referer"));
            Apis.Call(null, {
                version: Apis.Version,
                session: false,
                queries: [
                    {
                        "type": "startSession",
                        "data": ""
                    },
                    {
                        "type": "whoami",
                        "data": ""
                    },
                    {
                        "type": "respondWithCookie",
                        "data": "authResponse"
                    },
                    {
                        "type": "redirect",
                        "data": (window as any).launcher ? `file://${location.pathname.substr(0, location.pathname.length - "index.html".length)}callback/index.html` : "https://latipium.com/login/callback"
                    }
                ]
            });
        }

        public static Logout() {
            Apis.Call(() => {
                localStorage.removeItem("authSession");
                localStorage.removeItem("authName");
                if ( history.length > 1 ) {
                    history.back();
                } else {
                    location.href = "/";
                }
            }, {
                "type": "endSession",
                "data": ""
            });
        }

        private static _LoginCallback(res: ApiResponse) {
            let session: string;
            let name: string;
            for ( var i: number = 0; i < res.successful_queries.length; ++i ) {
                if ( res.successful_queries[i].type == "startSession" ) {
                    session = res.query_results[i];
                    if ( name ) {
                        break;
                    }
                } else if ( res.successful_queries[i].type == "whoami" ) {
                    name = res.query_results[i];
                    if ( session ) {
                        break;
                    }
                }
            }
            if ( session && name ) {
                localStorage.setItem("authName", name);
                localStorage.setItem("authSession", session);
                let url: string = localStorage.getItem("authReturn");
                if ( url ) {
                    localStorage.removeItem("authReturn");
                }
                location.href = url || "/";
            } else {
                location.href = "/login";
            }
        }

        public static LoginCallback() {
            let res: ApiResponse;
            if ( (window as any).launcher ) {
                let iframe: HTMLIFrameElement = document.createElement("iframe");
                iframe.hidden = true;
                iframe.src = "https://latipium.com/";
                document.body.appendChild(iframe);
                setTimeout(() => {
                    Authentication._LoginCallback(Apis.PopCookie("authResponse", iframe.contentDocument));
                    document.body.removeChild(iframe);
                }, 0);
            } else {
                Authentication._LoginCallback(Apis.PopCookie("authResponse"));
            }
        }
    }

    export class HeaderController {
        public constructor() {
            Angular.Controller("header", ($scope) => {
                let name: string = localStorage.getItem("authName");
                if ( name ) {
                    $scope.authenticated = true;
                    $scope.name = name;
                    Apis.Call(res => {
                        if ( res.successful_queries && res.successful_queries.length > 0 ) {
                            for ( var i: number = 0; i < res.successful_queries.length; ++i ) {
                                if ( res.successful_queries[i].type == "whoami" ) {
                                    if ( res.query_results[i] != name ) {
                                        localStorage.setItem("authName", res.query_results[i]);
                                        $scope.$apply(() => $scope.name = res.query_results[i]);
                                    }
                                } else if ( res.successful_queries[i].type == "listModules" ) {
                                    $scope.$apply(() => $scope.mods = res.query_results[i]);
                                }
                            }
                        } else {
                            localStorage.removeItem("authSession");
                            localStorage.removeItem("authName");
                            $scope.$apply(() => $scope.authenticated = false);
                        }
                    }, {
                        "type": "whoami",
                        "data": ""
                    }, {
                        "type": "listModules",
                        "data": ""
                    });
                } else {
                    $scope.authenticated = false;
                }
            });
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
                sessionStorage.setItem("referer", location.pathname);
            });
            Apis.Init();
            new HeaderController();
            exports.root = Com;
        }
    }
}

namespace _ {
    import Setup = Com.Latipium.Website.Setup;
    Setup.Main();
}
