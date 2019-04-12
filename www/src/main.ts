// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './app.vue';
import 'whatwg-fetch';
import 'es6-promise/auto';
import './temp-polyfills';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
	el: '#app',
	components: { App },
	template: '<App/>'
});
