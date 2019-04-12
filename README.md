# www-template
A skeleton project to demonstrate a minimal setup of an IMQS frontend app leveraging the www-lib sub-repository. 

## Running
To run the service from the command line:
1. Change port in `sample_config/*.json` files.
1. Add route from `/wwwtemplate` this port to `router-config.json` and restart ImqsRouter service. If you want to use you project's own URL path, rename all occurances of `wwwtemplate` in this repository to your project name.
1. Build: `go build`
1. Run: `wwwtemplate.exe -c config_sample/config.json`
1. Change directory to `www`
1. Run `npm run build` to compile, package and minify the code. The build artifacts will be in the `dist/` directory. 
1. Open [`http://localhost/wwwtemplate/www`](http://localhost/wwwtemplate/www) and you should see the app running (you will need a route for `/wwwtemplate` set up in router-config for this to work).

## Front-end Development
1. Run `npm run dev` to build an in-memory version of the build artifacts. This will live-update the parts of the page that changes as you develop.
1. Open [`http://localhost:2501/wwwtemplate/www/`](http://localhost:2501/wwwtemplate/www/) and you should see the app running.

## How to build your own project from this template
1. Fork this repository.
1. Search for all occurances of "wwwtemplate" and replace them with you project name.
