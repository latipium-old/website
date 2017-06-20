namespace Com.Latipium.Website.OAuth {
    export class Callback {
        public static Main() {
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
