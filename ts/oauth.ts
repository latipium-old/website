namespace Com.Latipium.Website.OAuth {
    export class Callback {
        public static Main() {
            if (location.search == "?travisci") {
                let expire = new Date();
                expire.setTime(expire.getTime() + 10 * 60 * 1000);
                document.cookie = "OAuthResponse=" + encodeURIComponent(JSON.stringify({
                    "access_token": "true",
                    "port": location.hash.substr(1)
                })) + "; expires=" + expire.toUTCString() + "; path=/;";
                location.href = "https://api.travis-ci.org/auth/handshake?redirect_uri=https://latipium.com/oauth";
            } else {
                let cookies = document.cookie.split("; ");
                var data;
                for (var i = 0; i < cookies.length; ++i) {
                    let parts = cookies[i].split("=");
                    if (parts[0] == "OAuthResponse") {
                        data = JSON.parse(decodeURIComponent(parts[1]));
                    }
                }
                let img = document.createElement("img");
                img.src = "http://localhost:" + data.port + "/" + data.access_token;
                img.classList.add("hidden");
                img.addEventListener("load", () => {
                    $(".oauth-progress").addClass("hidden");
                    $(".oauth-done").removeClass("hidden");
                    document.cookie = "OAuthResponse=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                });
                document.body.appendChild(img);
            }
        }
    }
}
