# www-template
A skeleton project to demonstrate a minimal setup of an IMQS frontend app leveraging the www-lib sub-repository. 

## To use this as a template 
1. Copy all code from this repo to your new repository
1. Add `www-lib` submodule: `git add submodule git@github.com:IMQS/www-lib.git www/src/lib`
1. Find and replace all occurances of `wwwtemplate` in this repository with your project name.

## To run from commandline
1. Change port in `sample_config/*.json` file to your service's port.
1. Add route from `/wwwtemplate` to appropriate port in `router-config.json` and restart ImqsRouter service. 
1. Build project by running: `node imqs-build.js prepare`
1. Run: `wwwtemplate.exe -c config_sample/config.json`
1. Open [`http://localhost/wwwtemplate/www/`](http://localhost/wwwtemplate/www/) (trailing slash is required) and you should see the app running.

## Front-end Development
1. Change directory to `/www`
1. Run `npm run dev` to build an in-memory version of the build artifacts. This will live-update the app as you develop.
1. Open [`http://localhost:2501/wwwtemplate/www/`](http://localhost:2501/wwwtemplate/www/) (trailing slash is required) and you should see the app running.

## How to exclude unused dependencies
If you remove some of the node packages in `package.json` that you know is not used in your project, the ForkTsCheckerWebpackPlugin compile will fail. This is because the plugin (for performance reasons) compiles all files in your entire project directory, including all files in `js/lib`, whether or not the file gets imported anywhere in you project. However, webpack will exclude the unused libaries and code from your build artifacts. So removing node packages used by `www-lib`, but not used by your project, won't have any effect on the build. The simplest thing to do is just to leave all node packages in `package.json`, whether or not they get used.
