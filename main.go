package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/IMQS/gowinsvc/service"
	"github.com/IMQS/wwwtemplate/config"
	"github.com/IMQS/wwwtemplate/globals"
	"github.com/IMQS/wwwtemplate/server"
)

var configfn = flag.String("c", "", "Config file to be used by the service if not using config service")
var schemafn = flag.String("s", "", "Schema file to be used by the service if not using config service")

func main() {
	os.Exit(realMain())
}

func realMain() int {
	flag.Parse()
	config, err := config.NewConfig(*configfn)
	if err != nil {
		fmt.Printf("Failed to get service config: %v", err)
		return 1
	}

	globals, err := globals.NewGlobals(config)
	if err != nil {
		globals.Log.Errorf("Service config error: %v", err)
		return 1
	}
	defer globals.Close()

	handler := func() error {
		return server.NewServer(globals).RunHTTPServer()
	}

	handlerNoRet := func() {
		handler()
	}

	if !service.RunAsService(handlerNoRet) {
		err = handler()
		if err != nil {
			globals.Log.Errorf("Service handler error: %v", err)
		}
	}

	if err != nil {
		globals.Log.Errorf("Service error: %v", err)
		return 1
	}
	return 0
}
