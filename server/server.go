package server

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/IMQS/wwwtemplate/globals"
	"github.com/gorilla/mux"
	"github.com/justinas/alice"
)

// Server struct hosts the http.Server and globals
type Server struct {
	http.Server
	globals *globals.Globals
}

func (s *Server) loggingHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		s.globals.Log.Debugf("[%s] %q %.3fms", r.Method, r.URL.String(), float64(time.Since(start).Nanoseconds())/float64(1e6))
		h.ServeHTTP(w, r)
	})
}

func (s *Server) noCacheHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Cache-Control", "no-cache, no-store, must-revalidate")
		w.Header().Add("Pragma", "no-cache")
		w.Header().Add("Expires", "0")
		h.ServeHTTP(w, r)
	})
}

// NewServer returns the Server instance
func NewServer(g *globals.Globals) *Server {
	r := mux.NewRouter()

	s := &Server{
		Server: http.Server{
			Addr:    g.Config.Server.Port,
			Handler: r,
		},
		globals: g,
	}

	// Alice creates a middleware chain which groups commonly used http handlers to be
	// executed in a sequential order for each http endpoint and only executes
	// the intended method after all of the methods before has completed.
	defaultHandler := alice.New(s.loggingHandler, s.noCacheHandler)

	// Backend APIs
	pingHandler := defaultHandler.ThenFunc(s.ping)
	r.Handle("/ping", pingHandler).Methods(http.MethodGet)

	// Frontend App
	fs := http.StripPrefix("/www", http.FileServer(http.Dir(s.globals.Config.PublicDir)))
	r.PathPrefix("/www").Handler(defaultHandler.Then(fs)).Methods(http.MethodGet)

	return s
}

func (s *Server) ping(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"Timestamp": %v}`, time.Now().Unix())
}

// RunHTTPServer sets up the ListenAndServe closer and then starts the http ListenAndServe worker
func (s *Server) RunHTTPServer() error {
	go s.close()

	err := s.ListenAndServe()
	if err != http.ErrServerClosed {
		s.globals.Log.Errorf("Failed to start http listen and serve: %v", err)
		return err
	}
	return nil
}

func (s *Server) close() {
	sigint := make(chan os.Signal, 1)
	signal.Notify(sigint, syscall.SIGINT, syscall.SIGTERM)
	<-sigint

	s.killSwitch()
}

func (s *Server) killSwitch() {
	err := s.Shutdown(context.Background())
	if err != nil {
		s.globals.Log.Errorf("Failed to shutdown http server: %v", err)
	}
	err = s.globals.Close()
	if err != nil {
		s.globals.Log.Errorf("Failed to stop globals: %v", err)
	}
	s.globals.Log.Error("Process killed")
}
