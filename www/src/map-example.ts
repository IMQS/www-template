import { Component } from "vue-property-decorator";
import Vue from "vue";
import MapExampleTemplate from './map-example.vue';
import L from 'leaflet';
import { MapGlobals, Globals, Control } from 'lib/map';
import { auth } from 'lib/auth';
import { IMapConfig } from 'lib/map/map-config';
import { idata } from 'lib/idata';
import { mapstyle } from 'lib/map/style';
import { MapURLKey } from 'lib/map/map-uri';
import { getHashQueryParam } from 'lib/base/uri';
import { showNotification } from 'lib/components/Dialog';

export const LEAFLET_OPTIONS = {
	coordinateControl: false,
	locateControl: false,
	zoomControl: false,
	measureControl: false,
	scaleControl: false,
	attributionControl: false,
	tap: false,
	doubleClickZoom: "center",
	inertiaMaxSpeed: 300,
	inertiaDeceleration: 1000,
	fadeAnimation: false
};

function createMapConfig(): IMapConfig {
	let m: IMapConfig = <IMapConfig>{};

	m.tileSubstitutionParams = (moduleName: string) => { return {}; };
	m.resilientRangesFromUriLink = (moduleName: string, tables: idata.Table[]) => { return []; };
	m.hasResilientfiltersFromUriLink = (moduleName: string) => { return false; };
	m.dynamicThemeParams = (moduleName: string) => { return {}; };
	m.scenarios = (moduleName: string) => { return ["Dummy"]; };
	m.scenarioLabels = (moduleName: string) => { return ["Dummy"]; };

	m.mapCoordinateSystem = undefined; // will default to Web Mercator
	m.isSystemOfMeasureIsImperial = false;
	m.isAriesActive = true;
	m.isEditAnnotations = false;
	m.scadaOptions = {};
	m.isSensorBadgeCount = false;
	m.isSensorClustering = false;
	m.isAlbionRasterFallback = false;
	m.googleMapsKey = undefined;
	m.useExternalTileCache = false;
	m.backgroundMaps = [];
	m.mapBaseLayerDefault = undefined;
	m.tableRouting = {};
	m.dbRouting = {};
	m.baseLayerLeafletOptions = {};
	m.defaultMapBounds = L.latLngBounds(L.latLng(-25.90154148, 27.93411255), L.latLng(-25.35302379, 28.42987061));
	m.defaultMapCenter = [-25.63626455, 28.24035645];
	m.defaultMapZoom = 11;

	return m;
}

export function initMapGlobals() {
	Globals.onPageLoad();
	MapGlobals.setConfig(createMapConfig());
	MapGlobals.setBackgroundLayersFromConfig();
	if (auth.isLoggedIn())
		MapGlobals.loadThemes(() => { });
}

@Component({
	mixins: [MapExampleTemplate]
})
export class MapExample extends Vue {
	mounted() {
		let themeURL = getHashQueryParam(MapURLKey.Theme.toString());
		if (!themeURL) {
			showNotification("Error", "No map theme specified in URL, try http://localhost:2501/wwwtemplate/www#t=IMQS.Annotation.Print");
			return;
		}

		let map = Control.new("template-map", LEAFLET_OPTIONS);

		let themeIdent: mapstyle.TripIdent = new mapstyle.TripIdent(themeURL);
		themeIdent.rewriteAuthorityToUser();
		map.layers.setCurrentThemeLayerFromTheme(themeIdent.toString());
	}
}
