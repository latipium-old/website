#!/bin/sh

# Ensure Bash is installed on the system
if which bash > /dev/null; then
    echo > /dev/null
else
    echo "This script must be run with 'bash' installed on your system."
    echo "Please install it, then restart this script."
    exit 1
fi

# Every 1024 bytes, there cannot be braced variables (bug in 'dtksh' shipped with
# Solaris 10 and UnixWare 7.1.1)
cat <<EndOfScript | bash
    # This script must always be run in Bash
    if [ "a\$BASH_VERSION" == "a" ]; then
        echo "Nice try, but symlinking '/bin/bash' to another shell will not"
        echo "work.  This script actually needs 'bash', so please install it,"
        echo "then restart this script."
        exit 1
    fi
    # Hopefully that is the end of non-Bash shells
    # But just in case, do one final check:

    #####################################
    # THIS SCRIPT MAY FAIL WITHOUT BASH #
    #     PUT IT BACK TO HOW IT WAS     #
    #####################################

    # error <message>
    # Any escape codes in 'message' will be expanded.
    function error() {
        echo -e "\$1" >&2
        exit 1
    }

    # installPkg [-nofail] <package name> [alternate name [altername name ...]]
    # if '-nofail' is specified, the script will not exit if the package cannot
    # be found.
    function installPkg() {
        cmd=
        if which apt > /dev/null; then
            apt update
            cmd="apt -y install"
        elif which yum > /dev/null; then
            yum update
            cmd="yum -y install"
        elif which pacman > /dev/null; then
            cmd="pacman -S --noconfirm"
        elif which apk > /dev/null; then
            cmd="apk add"
        elif [ "\$1" -eq "-nofail" ]; then
            echo "No known package management software found."
            return
        else
            error <<EOF
Unable to find a utility to install new software.  Please fix this, then
restart this script.  If you have a package management utility installed and
this script is not detecting it, please submit a bug report.
EOF
        fi
        isFirst=1
        for pkg in \$*; do
            if [ ! \$isFirst -eq 1 ] || [ "\$pkg" != "-nofail" ]; then
                \$cmd \$pkg
                if [ \$? -eq 0 ]; then
                    return
                fi
            fi
        done
        error <<EOF
A package was not able to be installed on your system.  This means either your
package manager does not work properly or the name of the package is different
in your distribution than this script expects.  If the name is different,
please submit a bug report containing the correct name of the package.
EOF
    }

    # download <URL> [output]
    # If 'output' is not specified, it outputs to STDOUT.
    function download() {
        if which curl > /dev/null; then
            if [ "a\$2" == "a" ]; then
                curl -L "\$1"
            else
                curl -o "\$2" -L "\$1"
            fi
        elif which wget > /dev/null; then
            if [ "a\$2" == "a" ]; then
                wget "\$1" -O --
            else
                wget -O "\$2" "\$1"
            fi
        else
            echo "No download utility could be found on your system."
            echo "Attempting to install one..."
            installPkg curl wget
            if which curl > /dev/null || which wget > /dev/null; then
                download "\$1" "\$2"
            else
                error <<EOF
Unable to install any download utility.  Please fix this, then restart this
script.  If you have a download utility installed and this script is not
detecting it, please submit a bug report.
EOF
            fi
        fi
    }

    # requireCommand <command> [package [alternate package ...]]
    function requireCommand() {
        which "\$1" > /dev/null
        if [ \$? -ne 0 ]; then
            installPkg \$*
        fi
    }

    # Main body of script
    if [ \$UID -ne 0 ]; then
        error <<EOF
Please run this script as root (try sudo).
EOF
    fi
    requireCommand tar
    requireCommand unzip zip
    downloadUrl=
    if [ "\$(uname)" == "Darwin" ]; then
        downloadUrl="https://github.com/electron/electron/releases/download/v1.4.1/electron-v1.4.1-darwin-x64.zip"
    elif uname -m | grep arm > /dev/null; then
        downloadUrl="https://github.com/electron/electron/releases/download/v1.4.1/electron-v1.4.1-linux-arm.zip"
    elif uname -m | grep 64 > /dev/null; then
        downloadUrl="https://github.com/electron/electron/releases/download/v1.4.1/electron-v1.4.1-linux-x64.zip"
    else
        downloadUrl="https://github.com/electron/electron/releases/download/v1.4.1/electron-v1.4.1-linux-ia32.zip"
    fi
    tmpdir=\$(mktemp -d)
    cd "\$tmpdir"
    download "\$downloadUrl" "electron.zip"
    unzip "electron.zip"
    rm "electron.zip"
    mv "electron" "Latipium"
    mkdir -p resources/app/{node_modules,_site/js}
    download "https://latipium.com/js/updater.js" "resources/app/_site/js/updater.js"
    cat <<EOF > "resources/app/manifest.json"
{"id":null}
EOF
    cat <<EOF > "resources/app/package.json"
{
    "name": "latipium-launcher",
    "productName": "Latipium",
    "version": "1.0.0",
    "main": "_site/js/updater.js"
}
EOF
    download "https://registry.npmjs.org/npm/-/npm-3.10.8.tgz" "npm.tar.gz"
    tar -xzf "npm.tar.gz" -C "resources/app/node_modules/"
    rm "npm.tar.gz"
    mv "resources/app/node_modules/package" "resources/app/node_modules/npm"
    cd /
    mv "\$tmpdir" "/usr/share/latipium"
    cat <<EOF > "/usr/bin/latipium"
#!/bin/sh

cd "/usr/share/latipium"
./Latipium
EOF
    chmod +x "/usr/bin/latipium"
    requireCommand mono mono-complete
    installPkg libxtst libxtst-dev
    installPkg libxss libxss-dev
    installPkg libgconf-2-4 libgconf-2-4-dev
    installPkg libnss3 libnss3-dev
    installPkg libasound libasound-dev libasound2 libasound2-dev
EndOfScript

# If you are seeing this message, you probably forgot to execute this script
# instead of just downloading it.  Please try the following:
# curl https://latipium.com | sudo sh
