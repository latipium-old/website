namespace Com.Latipium.Website.Dev.Publish {
    import Angular = Com.Latipium.Website.Angular;
    import Apis = Com.Latipium.Website.Apis;

    export class Setup {
        public static Main() {
            Angular.Controller("publish", ($scope) => {
                $scope.data = document.getElementById("publish_file_data");
                $scope.publish = () => $.ajax({
                    "async": true,
                    "data": $scope.data.files[0],
                    "method": "POST",
                    "processData": false,
                    "success": token => {
                        if ( token && token.length == 32 ) {
                            Apis.Call(res => {
                                if ( res && res.successful_queries && res.successful_queries.length && res.successful_queries.length == 1 ) {
                                    Materialize.toast("Package uploaded!", 4000, "", () => history.back());
                                } else {
                                    Materialize.toast("An error occured while uploading package (make sure the package id is correct)", 4000);
                                }
                            }, {
                                "type": "publishModule",
                                "data": token
                            });
                        } else {
                            Materialize.toast("An error occured while uploading package", 4000);
                        }
                    },
                    "url": "//apis.latipium.com/upload"
                });
            });
        }
    }
}

namespace _ {
    import Setup = Com.Latipium.Website.Dev.Publish.Setup;
    Setup.Main();
}
