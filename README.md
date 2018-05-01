### Angular5 Material5/Golang/Dex+OIDC/Couchbase/Signal Parse and load

This is a demonstration of different components for testing DEX +
angular. It is a rough first pass with angular 5/material5 and dex.

Security Note: The setup for couchbase run in docker isn't secure if
the host has ports exposed to an insecure intra or inter net.

BUG : Security setup to isolate couchbase needs to be repaired

TODO: paging update token page flush...

*Note that install commands assume yarn and debian based environment, modify for your OS*

Assuming an example.domain entry in your /etc/hosts and an ip address
of 192.168.0.26

#### Quick start Overview

```
go get github.com/couchbase/gocb
go get github.com/gorilla/handlers
go get github.com/gorilla/mux
go get github.com/satori/go.uuid
git clone git@github.com:AdminId20/signal-db-ui
go get github.com/coreos/dex
pushd ${GOPATH}/github.com/coreos/dex
make

# copy the binaries from bin to a known location like `/go/bin` or
# modify the run-dex script or add it to your path accordingly
# export PATH=path/to/dex/bin:${PATH}

```

- create certificates and setup your browser for them if they are self
  signed
- get client id and secrets for oauth backend services
- set PROJECT_EXT
- copy etc/environment.config.template.example to etc/environment.config.template.${PROJECT_EXT}
- edit / update etc/environment.config.template.${PROJECT_EXT}
- change each of the environment variables to your test values
- if you have a different number of admins [5 used in the example]
  update etc/environment.admins.config.template.all

- source the environment
- install angular components

```
# assuming debian/ubuntu or apt based linux 
pushd angular; sudo apt install -yq yarn; yarn install;
export PROJECT_EXT=example # fix this per your edits
cp etc/environment.config.template.example etc/environment.config.template.${PROJECT_EXT}
# edit: etc/environment.config.template.${PROJECT_EXT}
# source the environment
. etc/environment
# move the .${PROJECT_EXT} files in angular/src/app/ after validating them to 
# their .ts equivalents like  `mv abc.ts.${PROJECT_EXT} abc.ts`

# Caution: check your settings before blindly moving one, if you need
# to backup prior versions of:
# - angular/src/app/admin.auth.config.ts
# - angular/src/app/config.ts 
# back them up before:
# mv angular/src/app/admin.auth.config.ts.example angular/src/app/admin.auth.config.ts
# mv angular/src/app/config.ts.example angular/src/app/config.ts

# run serve, dex, angular
# docker run couchbase with persistent data

docker run --detach --net=host --privileged \
 -v /opt/couchbase/var/lib/couchbase:/opt/couchbase/var/lib/couchbase \
 couchbase

# Configure couchbase with an admin password to isolate from this.
pushd serve;
go run ./serve.go &
popd
pushd dex
./run-dex
popd
pushd angular
./ngcompile --host=${DOMAIN} --port=${ANGULAR_UI_PORT} --ssl
popd
echo serve.go is working, testing search using search-text
curl -s -X POST --cacert ${TLS_DIR}/ca.crt \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"text":"search-text"}' \
  -u "${APP_USER}:${APP_PASSWORD}" \
  https://${DOMAIN}:${GO_SERVICE_PORT}/search | \
    jq -r '.[]|.address'

echo "Point your browser to https://${DOMAIN}:${ANGULAR_UI_PORT}"

```

The backend ip address in `angular/src/environments/environment.ts`
should agree with the golang service

```
BACKEND_HOST: "192.168.0.26",
```

The `etc/environment` and `etc/example.domain` file's ip and or host
should agree with the certificates and host


```
go get github.com/couchbase/gocb
go get github.com/gorilla/handlers
go get github.com/gorilla/mux
go get github.com/satori/go.uuid
git clone git@github.com:AdminId20/signal-db-ui
cd signal-db-ui
mkdir -p bin
go build -tags netgo -ldflags '-w -s' -o bin/serve serve/serve.go
```

Run a couchbase instance in docker or other
```
docker run --privileged -v /opt/couchbase/var/lib/couchbase:/opt/couchbase/var/lib/couchbase --detach --net=host couchbase

docker run --detach --net=host --privileged \
 -v /opt/couchbase/var/lib/couchbase:/opt/couchbase/var/lib/couchbase \
 couchbase

```

An example certificate generator 
```
go get github.com/AdminId20/certutil/cmd/certgen
go build -tags netgo -ldflags '-w -s' -o bin/certgen github.com/AdminId20/certutil/cmd/certgen
bin/certgen --jsoncfg etc/example.domain
```

Download the SignalPlaintextBackup.xml from your phone to
`download/SignalPlaintextBackup.xml` or modify the path in
etc/environment from signal app to load messages from the file

Source the environment and run the backend service

```
. etc/environment
serve/serve 
```

curl + jq query

```
sudo apt install -yq jq

. etc/environment
curl -s -X POST --cacert tls/ca.crt \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"text":"gauth"}' \
  -u "${APP_USER}:${APP_PASSWORD}" \
  https://192.168.0.26:12345/search | \
    jq -r '.[]|.address'
```

Install angular components

Notice: that a modified helper script `angular/ngcompile`
ignores/discards terminal uglifier/colorizer allowing execution for
less output cruft while testing in an editor like emacs, or an IDE
that allow custom run commands terminal. Running from the angular
directory like the following, but please read ../README.md

```
cd angular
sudo apt install -yq yarn
yarn install 
./ngcompile --port=8123 --host=example.domain --ssl
``` 

---

There were some changes to the css for dex config matching some
aesthetic preference of a darker background.

