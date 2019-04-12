<template>
	<div id="app"
	     v-loading="!readyForMap && !loginFailed">
		<MapExample v-if="readyForMap" />

		<el-dialog title="IMQS Login failed"
		           :show-close="false"
		           :close-on-click-modal="false"
		           :close-on-press-escape="false"
		           :visible.sync="loginFailed"
		           width="30%">
			<span>{{loginFailedMessage}}</span>
		</el-dialog>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import Element from "element-ui";
import locale from 'element-ui/lib/locale/lang/en';
Vue.use(Element, { locale });
import vSelect from "vue-select";
Vue.component("v-select", vSelect);
import { Loading } from 'element-ui';
Loading.install(Vue);

import "leaflet/dist/leaflet.css";
import 'leaflet.locatecontrol';
import 'proj4leaflet';

import "element-ui/lib/theme-chalk/index.css";
import "lib/css/lib-styles";
import "lib/css/lib-styles-third-party";

import { MapExample, initMapGlobals } from "./map-example";
import { DBCollection, dbCollection } from './dbcollection';
import { auth } from 'lib/auth';
import { getHashQueryParam } from 'lib/base/uri';
import { WSListener } from 'lib/wslistener/wslistener';
import { UserStorage } from 'lib/storage/user_storage';
import { I18n } from 'lib/base/i18n/i18n';
import { loginEncoded } from 'lib/auth';

// Allow debugging with "Vue Devtool" and "Vue Performance" Chrome plugins.
Vue.config.devtools = true;
Vue.config.performance = true;

@Component({
	components: {
		MapExample
	}
})
export default class App extends Vue {
	readyForMap: boolean = false;
	loginFailed: boolean = false;
	loginFailedMessage: string = "Login failed";

	mounted() {

		let initGlobals = () => {
			WSListener.initWSListener();
			I18n.initI18n();
			UserStorage.initUserStorage();
			initMapGlobals();
			DBCollection.initDBCollection();
			dbCollection.onDbCollectionsMetadataLoaded.subscribe(() => {
				this.readyForMap = true; // mount the map
			});
		};

		let onLoginFail = (message: string): void => {
			this.loginFailedMessage = message;
			this.loginFailed = true;
		};

		if (!auth.isLoggedIn()) {
			// TODO: one day we will redirect to the IMQS login page and redirect back to the app once logged in
			onLoginFail("Log into IMQS first, we use the IMQS session to login.");
			return;
		}

		initGlobals();
	}
}
</script>

<style lang="less">
@import "./css/common.less";

#app {
	height: 100%;
}
</style>
