#!/bin/bash

authEmail=$(cat /etc/latipium/website/cloudflare/email)
authKey=$(cat /etc/latipium/website/cloudflare/key)
apiUrl="https://api.cloudflare.com/client/v4"

api() {
    method=$1
    url=$2
    query=$3

    curl -X "$method" "$apiUrl$url?$query" -H "X-Auth-Email: $authEmail" -H "X-Auth-Key: $authKey" -H "Content-Type: application/json" -d @-
}

updateRecords() {
    zoneId=$1
    type=$2
    value=$3
    
    for record in $(api GET /zones/$zoneId/dns_records type=$type | jq -r ".result[] | .id"); do
        api GET /zones/$zoneId/dns_records/$record       `# Download current record ` \
            | jq -c ".result"                            `# Remove surrounding json ` \
            | jq -c "del(.content)"                      `# Delete old value        ` \
            | jq -c ". + {\"content\": \"$value\"}"      `# Add new value           ` \
            | api PUT /zones/$zoneId/dns_records/$record `# Upload patched record   `
    done
}

getIP() {
    v="$1"

    curl "http://$v.ident.me/"
}

main() {
    zoneId=$(api GET /zones name=latipium.com | jq -r ".result[0].id")
    updateRecords "$zoneId" A "$(getIP v4)"
    updateRecords "$zoneId" AAAA "$(getIP v6)"
}

main
