*Note that install commands assume yarn and debian based environment, modify for your OS*

Assuming an example.domain entry in your /etc/hosts and an ip address
of 192.168.0.26

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

 
```
go get github.com/AdminId20/certutil/cmd/certgen
go build -tags netgo -ldflags '-w -s' -o bin/certgen github.com/AdminId20/certutil/cmd/certgen
bin/certgen --jsoncfg etc/example.domain
```

Download the SignalPlaintextBackup.xml to
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

Notice: that a modified helper script `angular/ngcompile` ignores/discards
terminal uglifier/colorizer allowing execution for testing in an emacs
terminal. Running from the angular directory like the following, but
please read ../README.md

```
cd angular
sudo apt install -yq yarn
yarn install 
./ngcompile --port=8123 --host=example.domain --ssl
``` 
