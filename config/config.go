package config

import (
	serviceconfig "github.com/IMQS/serviceconfigsgo"
)

const configVersion = 1
const defaultPublicDir = "c:/imqsbin/public/wwwtemplate"
const serviceConfigFileName = "wwwtemplate.json"
const serviceName = "wwwtemplate"

// Config hosts the general configuration for the entire service
type Config struct {
	Server     *Server `json:"server"`
	LogFile    string  `json:"logfile"`
	LogLevel   string  `json:"loglevel"`
	PublicDir  string  `json:"publicdir"`
	BypassAuth bool    `json:"bypassauth"` // for unit tests
}

// NewConfig gets the service configuration either from file or the configuration service
func NewConfig(filename string) (*Config, error) {
	c := &Config{}

	if err := serviceconfig.GetConfig(filename, serviceName, configVersion, serviceConfigFileName, c); err != nil {
		return nil, err
	}

	if len(c.PublicDir) == 0 {
		c.PublicDir = defaultPublicDir
	}

	return c, nil
}
