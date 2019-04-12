package main

import (
	"fmt"
	"net/http"
	"os"
	"testing"

	"github.com/IMQS/wwwtemplate/config"
	"github.com/IMQS/wwwtemplate/globals"
	"github.com/IMQS/wwwtemplate/server"
)

var testServer *server.Server
var testGlobals *globals.Globals
var result *http.Response

const originURL = "http://localhost:2040"

func setup() error {
	c, err := config.NewConfig("./config_sample/config-test.json")
	if err != nil {
		return fmt.Errorf("Error config init %v", err)
	}

	testGlobals, err = globals.NewGlobals(c)
	if err != nil {
		return fmt.Errorf("Error globals init %v", err)
	}

	testServer = server.NewServer(testGlobals)

	run := func() {
		err := testServer.RunHTTPServer()
		if err != nil {
			testGlobals.Log.Errorf("Error running HTTP server: %v", err)
		}
	}

	go run()

	return nil
}

func teardown() error {
	return testGlobals.Close()
}

func doRequest(verb, url string) (*http.Response, error) {
	request, err := http.NewRequest(verb, url, nil)
	if err != nil {
		return nil, err
	}
	return http.DefaultClient.Do(request)
}

func checkHTTPResponseCode(t *testing.T, expected, actual int) {
	if expected != actual {
		t.Errorf("Expected http response code %d. Got %d\n", expected, actual)
	}
}

func TestMain(m *testing.M) {
	// setup the test db and run the migrations if any
	if err := setup(); err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	}

	retCode := m.Run()

	if err := teardown(); err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	}

	os.Exit(retCode)
}

func TestPing(t *testing.T) {
	r, err := doRequest("GET", fmt.Sprintf("%v/ping", originURL))
	if err != nil {
		t.Fatal(err)
	}
	checkHTTPResponseCode(t, http.StatusOK, r.StatusCode)
}
