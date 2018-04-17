package main

/*
CREATE PRIMARY INDEX ON `example` USING GSI;
CREATE INDEX name_index ON example(contact_name) USING GSI;
CREATE INDEX message_index ON example(body) USING GSI;
DELETE FROM `example`;
*/
import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/couchbase/gocb"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/satori/go.uuid"

	"github.com/AdminId20/go-cfg"
	"github.com/AdminId20/go-signalstor"
	"github.com/AdminId20/transform"
	yaml "gopkg.in/yaml.v2"
)

// Post structure for create/parse/management
type Post struct {
	Text        string `json:"text"`
	Address     string `json:"address"`
	Timestamp   string `json:"date"` // millisecond resolution sms timestamp
	ContactName string `json:"contact_name"`
	Date        string `json:"readable_date"`
	Subject     string `json:"subject"`
	Body        string `json:"body"`
	Type        string `json:"type" doc:"1 received, 2 sent"`
}

// NS for signal setup
var NS = uuid.NamespaceURL

var app App

// App application configuration struct
type App struct {
	Cert            string
	Key             string
	Path            string
	User            string
	Password        string
	Host            string
	Port            string
	CouchbaseHost   string
	CouchbaseBucket string
	Filename        string
	// TraceDetailed bool
	// TraceEnabled  bool
}

// Build version build string
var Build string

// Commit version commit string
var Commit string

// Message example ORM object
type Message struct {
	GUID    string    `json:"id,omitempty"`
	Created time.Time `json:"create,omitempty"`
	Updated time.Time `json:"update,omitempty"`
	signalstor.SmsMessage
}

var bucket *gocb.Bucket
var bucketName string

// ListEndpoint dynamic query builder
func ListEndpoint(w http.ResponseWriter, req *http.Request) {
	log.Println("ListEndpoint")
	var messages []Message
	text := "SELECT `" + bucketName + "`.* FROM `" + bucketName + "`  limit 100"

	// text := "SELECT `" + bucketName + "`.* FROM `" + bucketName + "` WHERE LOWER(contact_name) LIKE '%' || LOWER($1) || '%' limit 100"
	// log.Println(text)
	// var n1qlParams []interface{}
	// n1qlParams = append(n1qlParams, strings.ToLower(params["contact_name"]))

	query := gocb.NewN1qlQuery(text)
	query.Consistency(gocb.RequestPlus)
	rows, _ := bucket.ExecuteN1qlQuery(query, nil)
	var row Message
	for rows.Next(&row) {
		SetRow(&row)
		messages = append(messages, row)
		row = Message{}
	}
	if messages == nil {
		messages = make([]Message, 0)
	}
	json.NewEncoder(w).Encode(messages)
}

// SearchPost search db
func SearchPost(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("JSONify\n%s\n\n", JSONify(r.Body))
	fmt.Println(JSONify(r.Body))
	decoder := json.NewDecoder(r.Body)

	var data = Post{}
	err := decoder.Decode(&data)
	if err != nil {
		panic(err)
	}
	fmt.Println(JSONify(data))
	Query(w, r, "SearchEndpoint", "text")
}

// SearchEndpoint search db
func SearchEndpoint(w http.ResponseWriter, r *http.Request) {
	Query(w, r, "SearchEndpoint", "text")
}

// Query abstraction
func Query(w http.ResponseWriter, r *http.Request, fname, field string) {
	var messages []Message
	var params = mux.Vars(r)
	var n1qlParams []interface{}

	var sql = fmt.Sprintf(`
SELECT
   %s.* 
FROM 
  %s
WHERE 
  LOWER(%s) LIKE '%%' || LOWER($1) || '%%' 
OR
  LOWER(%s) LIKE '%%' || LOWER($1) || '%%' 
OR
  LOWER(%s) LIKE '%%' || LOWER($1) || '%%' 
OR
  LOWER(%s) LIKE '%%' || LOWER($1) || '%%' 
LIMIT 100`,
		bucketName,
		bucketName,
		"address",
		"contact_name",
		"readable_date",
		"body")
	var query = gocb.NewN1qlQuery(sql)
	var search = params[field]
	for i := 0; i < 4; i++ {
		n1qlParams = append(n1qlParams, search)
	}

	log.Println(fname, "endpoint", params)
	log.Printf("params\n%s\n", JSONify(params))
	log.Printf("params[\"%s\"] = %s\n", field, params[field])
	log.Printf("%v\n%v\n", query, n1qlParams)

	query.Consistency(gocb.RequestPlus)
	rows, _ := bucket.ExecuteN1qlQuery(query, n1qlParams)
	var row Message
	for rows.Next(&row) {
		SetRow(&row)
		messages = append(messages, row)
		row = Message{}
	}
	if messages == nil {
		messages = make([]Message, 0)
	}
	// log.Printf("\n%s\n", Yamlify(messages))
	json.NewEncoder(w).Encode(messages)
}

// NameSearch endpoint search db
func NameSearch(w http.ResponseWriter, r *http.Request) {
	Query(w, r, "NameSearch", "contact_name")
}

// PhoneSearch endpoint search db
func PhoneSearch(w http.ResponseWriter, r *http.Request) {
	Query(w, r, "PhoneSearch", "address")
}

// DateSearch endpoint search db
func DateSearch(w http.ResponseWriter, r *http.Request) {
	Query(w, r, "DateSearch", "readable_date")
}

// MessageSearch endpoint search db
func MessageSearch(w http.ResponseWriter, r *http.Request) {
	Query(w, r, "MessageSearch", "body")
}

func SetRow(row *Message) {
	if row != nil && len(row.Address) > 15 {
		row.Address = row.Address[0:15]
	}

}

// Key info
type Key struct {
	Address     string `json:"address"`
	Timestamp   string `json:"date"` // millisecond resolution sms timestamp
	ContactName string `json:"contact_name"`
	Date        string `json:"readable_date"`
	Subject     string `json:"subject"`
}

// NewKey from message
func NewKey(message signalstor.SmsMessage) (key *Key) {
	key = &Key{}
	key.Address = message.Address
	key.Timestamp = message.Timestamp
	key.ContactName = message.ContactName
	key.Date = message.Date
	key.Subject = message.Subject
	return key
}

// String from Key
func (key *Key) String() string {
	s := fmt.Sprintf(
		"signal://%s/%s/%s/%s/%s",
		key.Address,
		key.Timestamp,
		key.ContactName,
		key.Date,
		key.Subject)
	return s
}

// UUID from a key object
func (key *Key) UUID() uuid.UUID {
	return uuid.NewV5(NS, key.String())
}

// CreateEndpoint in bucket
func CreateEndpoint(w http.ResponseWriter, req *http.Request) {
	log.Println("CreateEndpoint")
	var message Message
	_ = json.NewDecoder(req.Body).Decode(&message)
	var key = NewKey(message.SmsMessage).UUID().String()
	message.GUID = key
	// message.GUID = uuid.NewV4().String()
	log.Printf("%v %v\n", message.GUID, message)
	log.Printf("\n%s\n", Yamlify(message))
	bucket.Upsert(message.GUID, message, 0)
	json.NewEncoder(w).Encode(message)
}

func init() {
	var err error
	if err = cfg.ProcessHoldFlags("APP", &app); err != nil {
		log.Fatalf("%v\n", err)
	}
	cfg.Freeze()
	if false {
		array := strings.Split(os.Args[0], "/")
		me := array[len(array)-1]
		fmt.Println(me, "version built at:", Build, "commit:", Commit)
	}
}

func load() {
	var err error
	var rawData []byte
	var messages signalstor.SmsMessages

	rawData, err = ioutil.ReadFile(app.Filename)
	if err != nil {
		fmt.Printf("error: Download failed %v\n", err)
		os.Exit(-1)
	}
	signalstor.XMLParse(rawData, &messages, signalstor.SmsXMLFixUp, signalstor.NoOp)
	for _, message := range messages.Messages {
		var GUID = NewKey(message).UUID().String()
		log.Printf("%v %v\n", GUID, message)
		log.Printf("\n%s\n", Yamlify(message))
		bucket.Upsert(GUID, message, 0)

	}

}

func main() {
	var CouchbaseURI = fmt.Sprintf("couchbase://%s", strings.Trim(app.CouchbaseHost, " "))
	var HostURI = fmt.Sprintf("https://%s:%s", app.Host, app.Port)
	fmt.Printf("Starting server at %s\n", HostURI)
	fmt.Printf("Connecting to persistent store couchbase://%s\n", strings.Trim(app.CouchbaseHost, " "))

	cluster := &gocb.Cluster{}

	cluster, _ = gocb.Connect(CouchbaseURI)

	cluster.Authenticate(gocb.PasswordAuthenticator{
		Username: app.User,
		Password: app.Password,
	})

	bucketName = app.CouchbaseBucket
	bucket, _ = cluster.OpenBucket(bucketName, "")
	bucket.Manager("", "").CreatePrimaryIndex("", true, false)

	load()

	router := mux.NewRouter()
	router.HandleFunc("/messages", ListEndpoint).Methods("GET")
	router.HandleFunc("/messages", CreateEndpoint).Methods("POST")
	router.HandleFunc("/search/{text}", SearchEndpoint).Methods("GET")
	router.HandleFunc("/search/{text}", SearchPost).Methods("POST")

	fmt.Println("Couchbase       at " + ": " + CouchbaseURI)
	fmt.Println("Service HostURI at " + ": " + HostURI)
	fmt.Println("Bucket on which    " + ": " + app.CouchbaseBucket)
	fmt.Println("Port   on which    " + ": " + app.Port)
	fmt.Println("Host   interface   " + ": " + app.Host)
	fmt.Printf("HTTPS/Listening on %s:%s and serving path: %s\n", app.Host, app.Port, app.Path)

	url := fmt.Sprintf("%s:%s", app.Host, app.Port)
	for {
		err := http.ListenAndServeTLS(url, app.Cert, app.Key,
			handlers.CORS(
				handlers.AllowedMethods(
					[]string{"GET", "POST", "PUT", "HEAD"}),
				handlers.AllowedOrigins([]string{"*"}))(router))
		if err != nil {
			log.Fatal(fmt.Sprintf("https://%s\nError %v\n", url, err))
		}
		time.Sleep(1)
	}
}

// JSONify an object
func JSONify(data interface{}) string {
	var err error
	data, err = transform.TransformData(data)
	if err != nil {
		return fmt.Sprintf("%v", err)
	}
	s, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return fmt.Sprintf("%v", err)
	}
	return string(s)
}

// Yamlify object to yaml string
func Yamlify(data interface{}) string {
	data, err := transform.TransformData(data)
	if err != nil {
		return fmt.Sprintf("%v", err)
	}
	s, err := yaml.Marshal(data)
	if err != nil {
		return fmt.Sprintf("%v", err)
	}
	return string(s)
}
