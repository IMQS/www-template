const util = require('./imqs-build-util');

oldGoPath = process.env["GOPATH"]
const out_bin = process.platform === "win32" ? "../out/bin" : "out-wwwtemplate";
const out_www = process.platform === "win32" ? "../out/public/wwwtemplate" : "out-wwwtemplate";
const gopath = process.platform === "win32" ? `${process.env["USERPROFILE"]}\\go` : `${process.env["HOME"]}/go`;
console.log(`Setting GOPATH to ${gopath}`);
process.env["GOPATH"] = gopath;

function at_exit() {
	process.env["GOPATH"] = oldGoPath;
}

async function run() {
	const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
	// install node build utilities
	await util.exec_dont_die(npmCommand, ["install", "--save-dev", "ncp", "mkdirp"]);

	switch (process.argv[2]) {
		case "clean":
			break;

		case "prepare":
			// Build binary
			await util.exec_or_die("go", ["build"]);
			await util.exec_dont_die("git", ["checkout", "--", "go.mod"]);

			// Build frontend
			await util.exec_or_die(npmCommand, ["run", "build"], "www");
			await util.exec_dont_die("git", ["checkout", "--", "package.json"], "www");
			await util.exec_dont_die("git", ["checkout", "--", "package-lock.json"], "www");
			break;

		case "copy_out":
			// Frontend
			await util.make_dir(out_www);
			await util.copy_to("www/dist", out_www);

			// Copy the windows binary to the binaries folder. This assumes that "copy_out" will only be used for Windows builds
			await util.copy_to_dir("wwwtemplate.exe", out_bin);
			break;

		case "test_unit":
			// The very first test that executes against the postgres backend must run with
			// just 1 CPU. This is to ensure that if migrations need to run, then they do so
			// before anything else runs.
			// await exec_or_die("go test -test.cpu 1");

			// await exec_or_die("go test -race -test.cpu 2");

			await util.exec_or_die("go", ["test"]);
			break;

		case "test_integration":
			break;

		default:
			console.log(`Unknown parameter ${process.argv[2]}`);
	}

	at_exit();
}

process.on('unhandledRejection', err => {
	util.die(err);
});

run();
