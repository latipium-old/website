#!/bin/bash

mkdir -p _site
cat <<EOF > _site/index.html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>Hello, world!</title>
	</head>
	<body>
		<h1>Hello, world!</h1>
	</body>
</html>
EOF
cat <<EOF > _site/CNAME
www.latipium.com
EOF
