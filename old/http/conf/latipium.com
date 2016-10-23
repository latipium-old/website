server {
    listen 443 ssl default_server;
    index index.html;
    root /srv/;
    server_name latipium.com;
    include snippets/snakeoil.conf;
    more_set_headers "X-Frame-Options: ALLOW-FROM file:///";
    location / {
        error_page 404 /index.html;
    }
    set $downloadScript no;
    if ( $http_user_agent ~* "curl" ) {
        set $downloadScript yes;
    }
    if ( $http_user_agent ~* "Wget" ) {
        set $downloadScript yes;
    }
    if ( $downloadScript = yes ) {
        rewrite ^/$ /electron/install.sh;
    }
}
