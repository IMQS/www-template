package globals

import (
	"github.com/IMQS/log"
	"github.com/IMQS/wwwtemplate/config"
)

// Globals struct contains all of the global usage elements
type Globals struct {
	Config *config.Config
	Log    *log.Logger
}

func pickLogFile(filename, defaultFilename string) string {
	if filename != "" {
		return filename
	}
	return defaultFilename
}

// NewGlobals returns the Globals struct
func NewGlobals(c *config.Config) (*Globals, error) {
	g := &Globals{
		Config: c,
	}

	g.Log = log.New(pickLogFile(g.Config.LogFile, log.Stdout))
	if len(g.Config.LogLevel) > 0 {
		loglevel, err := log.ParseLevel(g.Config.LogLevel)
		if err != nil {
			g.Log.Errorf("Failed to parse logging level: %v", err)
			return nil, err
		}
		g.Log.Level = loglevel
	}

	return g, nil
}

// Close stops all of the globally mananged service internals
func (s *Globals) Close() error {
	// do cleanup, such as closing DB connections, etc. here
	return nil
}
