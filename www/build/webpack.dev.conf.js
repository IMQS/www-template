const merge = require('webpack-merge');
const path = require('path')
const baseConfig = require('./webpack.base.conf.js');

module.exports = merge(baseConfig, {
	devtool: 'cheap-module-eval-source-map',

	devServer: {
		inline: true,
		clientLogLevel: 'warning',
		stats: {
			errorDetails: true,
			colors: true,
			modules: true,
			reasons: true,
		},
		port: 2501,
		proxy: {
			"/": {
				target: "http://localhost",
				secure: false,
				changeOrigin: true,
			}
		},
		watchOptions: {
			ignored: /node_modules|src\/lib\/node_modules/
		},
		historyApiFallback: true,
		publicPath: "/wwwtemplate/www/",
		contentBase: path.resolve(__dirname, '../static')
	},

	module: {
		rules: [
		]
	},

	plugins: [
	]
});
