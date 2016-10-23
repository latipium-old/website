namespace Com.Latipium.Website.Dev.NewMod {
    import Angular = Com.Latipium.Website.Angular;
    import Apis = Com.Latipium.Website.Apis;

    export class Setup {
        public static Main() {
            Angular.Controller("newMod", ($scope) => {
                $scope.generateNamespace = (homepage, module) => {
                    let url: string = homepage ? homepage.substr(homepage.indexOf("//") + 2) : "";
                    let domain: string = homepage ? url.substr(0, url.indexOf("/")) : "";
                    let path: string = homepage ? url.substr(domain.length + 1) : "";
                    let reverseDomain: string = homepage ? domain.split('.').reverse().join('.') : "";
                    let modName: string = module ? module.replace(/[^A-Za-z0-9]+/g, "") : "";
                    let randomCase: string = (reverseDomain + "." + path + "." + modName).replace(/\.\.+/g, '.');
                    let components: string[] = randomCase.split('.');
                    for ( var i: number = 0; i < components.length; ++i ) {
                        components[i] = components[i].charAt(0).toUpperCase() + components[i].substr(1);
                    }
                    return components.join('.');
                };
                $scope.create = (namespace) => Apis.Call(res => {
                    if ( res && res.successful_queries && res.successful_queries.length && res.successful_queries.length == 1 ) {
                        Materialize.toast("Module created!", 1000, "", () => location.href = "/dev/mods/my#" + namespace);
                    } else {
                        Materialize.toast("A module with that name already exists!", 4000);
                    }
                }, {
                    "type": "createModule",
                    "data": namespace
                });
            });
        }
    }
}

namespace _ {
    import Setup = Com.Latipium.Website.Dev.NewMod.Setup;
    Setup.Main();
}
