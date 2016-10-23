server {
    listen 443 ssl;
    server_name apis.latipium.com;
    include snippets/snakeoil.conf;
    more_set_headers "Access-Control-Allow-Origin: https://latipium.com";
    more_set_headers "Access-Control-Allow-Methods: GET, POST, OPTIONS";
    more_set_headers "Access-Control-Allow-Headers: DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Pragma";
    if ( $request_method = "OPTIONS" ) {
        return 200;
    }
    location / {
        fastcgi_pass apis:9000;
        include fastcgi_params;
        client_max_body_size 5M;
        valid_referers none blocked latipium.com apis.latipium.com accounts.google.com;
        if ( $invalid_referer ) {
            return 403;
        }
    }
    rewrite ^/nuget/$ /public/index.php;
    rewrite ^/nuget/\$metadata$ /public/metadata.xml;
    rewrite ^/nuget/Search\(\)/\$count$ /public/count.php;
    rewrite ^/nuget/Search\(\)$ /public/search.php;
    rewrite ^/nuget/Packages\(\)$ /public/search.php;
    rewrite ^/nuget/Packages\(Id='([^']+)',Version='([^']+)'\)$ /public/findByID.php?id=$1&version=$2;
    rewrite ^/nuget/GetUpdates\(\)$ /public/updates.php;
    rewrite ^/nuget/FindPackagesById\(\)$ /public/findByID.php;
    rewrite ^//?nuget//?download/([^/]+)/([^/]+)$ /public/download.php?id=$1&version=$2;
    location = /public/index.php {
        internal;
        fastcgi_pass nuget:9000;
        include fastcgi.conf;
        root /var/local/simple-nuget-server/;
    }
    location /packagefiles/ {
        internal;
        root /var/local/;
    }
    location /public/ {
        internal;
        fastcgi_pass nuget:9000;
        include fastcgi.conf;
        root /var/local/simple-nuget-server/;
    }
}
