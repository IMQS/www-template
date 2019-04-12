// TODO: move base functionality to www-lib and derive from that baseclass

import { idata, IIdataCollectionSource } from "lib/idata";
import { log } from 'lib/log';
import { auth } from 'lib/auth';
import { Event } from 'lib/base/event';
import { replaceScenarioTable } from 'lib/map/map-util';
import { MapGlobals } from 'lib/map/map-globals';
import { IMQS } from 'lib/idata/transport_IMQS';

export let dbCollection: DBCollection;
const flagAll = idata.TransportFlags.EnableBackendCache | idata.TransportFlags.EnableCache | idata.TransportFlags.HasMetadataGET;
const TABLE_QUALIFIER_SEPARATOR = ".";

export class DBCollection implements IIdataCollectionSource {
	// real DBs (server-side)
	mainDB!: idata.Collection;

	dbCollections: idata.Collection[] = [];			// Only DBs activated via client-config-public.json are included in this list
	dbCollectionsMetadataLoaded: boolean = false;	// Set to true after all DB metadata has been fetched
	onDbCollectionsMetadataLoaded: Event<any> = new Event<any>();

	private dbAliasToCollectionMap: { [alias: string]: idata.Collection; } = {};

	onDoRefresh: Event<any> = new Event<any>();

	constructor() {

	}

	private makeAriesDB(dbName: string, flags: idata.TransportFlags): idata.Collection {
		const ariesTransport = IMQS.make("/crud");
		const db = new idata.Collection(dbName);
		db.io.setTransport(ariesTransport, flags);
		return db;
	}

	initDBs() {
		this.mainDB = this.makeAriesDB("ImqsServerMain", flagAll);
		this.dbCollections = [this.mainDB];

		if (auth.isLoggedIn()) {
			this.fetchDBMetadataForEnabledDBs();
		}
	}

	private static findDatabaseFromDBAlias(list: idata.Collection[], dbAlias: string): idata.Collection | null {
		for (let i = 0; i < list.length; i++) {
			if (list[i].name == dbAlias)
				return list[i];
		}
		return null;
	}

	getCollectionFromDBAlias(dbAlias: string): idata.Collection | null {
		return DBCollection.findDatabaseFromDBAlias(this.dbCollections, dbAlias);
	}

	private fetchAllLookupData(dbCollections: idata.Collection[], doRefresh: boolean = true, onFinish?: () => void) {
		const lookupTabs: idata.Table[] = [];

		for (const collection of dbCollections) {
			for (const tab of collection.tables) {
				for (const fieldDesc of tab.type.fields) {
					if (fieldDesc.tags.indexOf("lookup") === -1) continue;

					const lookupSplit = fieldDesc.alias.split("|");
					if (lookupSplit.length < 3) {
						log.logErr(`Illegal lookup format: must have at least 3 parts (lookup table,condition,lookup value) split by | character ${fieldDesc.alias}`);
						continue;
					}

					let lookupTab;
					const qualifiedTableName = lookupSplit[0].split(TABLE_QUALIFIER_SEPARATOR);
					if (qualifiedTableName.length === 2) {
						lookupTab = this.getTableInCollection(qualifiedTableName[0], qualifiedTableName[1]);
					} else {
						lookupTab = tab.collection.tableByName(lookupSplit[0]);
					}

					if (!lookupTab) {
						log.logErr(`Illegal lookup: Table does not exist: ${lookupSplit[0]}`);
						continue;
					}

					lookupTabs.push(lookupTab);
				}
			}
		}

		const done = () => {
			this.dbCollectionsMetadataLoaded = true;
			this.onDbCollectionsMetadataLoaded.trigger();
			log.logTrace("Done with DB metadata pull");
			if (doRefresh)
				this.onDoRefresh.trigger();
			if (onFinish)
				onFinish();
		};

		if (lookupTabs.length === 0) {
			done();
			return; // nothing left to do
		}

		let counter = 0;
		const onFinishLookupPull = () => {
			counter++;
			if (counter === lookupTabs.length)
				done();
		};

		for (const lookupTab of lookupTabs) {
			const req = new idata.PullRequest();
			req.setElement(idata.PullRequestElement.makeAll(lookupTab));
			lookupTab.collection.io.pull(req, function (future) {
				onFinishLookupPull();
			});
		}
	}

	getTableInCollection(collectionName: string, tableName: string): idata.Table | null {
		const c = this.dbAliasToCollectionMap[collectionName];
		if (c)
			return c.tableByName(tableName);

		return null;
	}

	fetchDBMetadataForEnabledDBs() {
		let remain = this.dbCollections.length;
		const onFetch = () => {
			remain--;
			if (remain == 0) {
				// this will call iq.refresh once it is done
				this.fetchAllLookupData(this.dbCollections);
			}
		};

		// pull metadata for enabled collections
		for (const collection of this.dbCollections) {
			const req = collection.io.makeMetadataOnlyRequest();
			collection.io.pull(req, onFetch);
		}
	}

	public static initDBCollection() {
		dbCollection = new DBCollection();
		dbCollection.initDBs();
		MapGlobals.setIdataCollectionSource(dbCollection);
	}

	getTableFriendlyName(tableName: string): string {
		return replaceScenarioTable(tableName, "");
	}
}
