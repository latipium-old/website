namespace Com.Latipium.Website.Dev.MyMods {
    import Angular = Com.Latipium.Website.Angular;
    import Apis = Com.Latipium.Website.Apis;

    export class Setup {
        private static XMLToJSON(text: string): any {
            let doc: XMLDocument = $.parseXML(text);
            let propertiess: NodeListOf<Element> = doc.getElementsByTagNameNS("http://schemas.microsoft.com/ado/2007/08/dataservices/metadata", "properties");
            if ( propertiess.length != 1 ) {
                return null;
            }
            let properties: Element = propertiess.item(0);
            let obj = {};
            for ( var j: number = 0; j < properties.childNodes.length; ++j ) {
                let property: Node = properties.childNodes.item(j);
                obj[property.localName] = property.textContent;
            }
            return obj;
        }

        public static Main() {
            Angular.Controller("myMods", ($scope, $http) => {
                $scope.mods = [];
                $scope.location = location;
                $scope.safeId = (id: string) => id.replace(/[^A-Za-z0-9]+/g, '_');
                location.hash = "#" + $scope.safeId(location.hash.substr(1));
                Apis.Call(res => {
                    if ( res && res.query_results && res.query_results.length && res.query_results.length == 1 ) {
                        $scope.mods = [];
                        var loaded = 0;
                        for ( var i: number = 0; i < res.query_results[0].length; ++i ) {
                            let id: string = res.query_results[0][i];
                            $http.get("//apis.latipium.com/nuget/FindPackagesById()?$top=1&id=" + id).then(data => {
                                let mod = Setup.XMLToJSON(data.data);
                                if ( mod == null ) {
                                    mod = {
                                        "Id": id,
                                        "Published": false
                                    };
                                } else {
                                    mod.Id = id;
                                    mod.Published = true;
                                }
                                $scope.mods.push(mod);
                                if ( ++loaded == res.query_results[0].length ) {
                                    $scope.loaded = true;
                                    setTimeout(() => ($("ul.my-mods-tabs.tabs") as any).tabs(), 0);
                                }
                            });
                        }
                    } else {
                        location.href = "/login";
                    }
                }, {
                    "type": "listModules",
                    "data": ""
                });
            });
        }
    }
}

namespace _ {
    import Setup = Com.Latipium.Website.Dev.MyMods.Setup;
    Setup.Main();
}
