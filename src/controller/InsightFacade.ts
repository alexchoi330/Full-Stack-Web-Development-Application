import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import JSZip from "jszip";
import fs from "fs-extra";
import {persistDir} from "../../test/TestUtil";
/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {

	private datasetContents;
	private idKindMapping;
	private persistDir = "./data";

	constructor() {
		this.datasetContents =  new Map<string, Map<string, any[]>>();
		this.idKindMapping = new Map<string, InsightDatasetKind>();
		// console.trace("InsightFacadeImpl::init()");
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if(id.includes("_")
			|| this.datasetContents.has(id)
			|| !id.replace(/\s/g, "").length) {
			return Promise.reject(new InsightError("id contains an underscore"));
		}
		const jsZip = new JSZip();
		let courseSections = new Map<string, any[]>();

		await jsZip.loadAsync(content, {base64: true});
		for (const filename of Object.keys(jsZip.files)) {
			let fileData = await jsZip.files[filename].async("string");
			try {
				let data = JSON.parse(fileData);
				let coursePath = filename.split("/");
				courseSections.set(coursePath[coursePath.length - 1], data);
			} catch (e) {
				// do nothing
			}
		}

		// if we are doing async
		// jsZip.loadAsync(content, {base64: true}).then(function (zip) {
		// 	Object.keys(zip.files).forEach(function (filename) {
		// 		zip.files[filename].async("string").then(function (fileData) {
		// 			let data = JSON.parse(fileData);
		// 			courseSections.set(filename, data);
		// 		});
		// 	});
		// });

		this.datasetContents.set(id, courseSections);
		this.idKindMapping.set(id, kind);
		this.saveToDisk(this.datasetContents.get(id) as Map<string, any[]>, this.persistDir + "/" + id + "/");
		return Promise.resolve(Array.from(this.datasetContents.keys()));
	}

	public removeDataset(id: string): Promise<string> {
		if(id.includes("_")
			|| !id.replace(/\s/g, "").length) {
			return Promise.reject(new InsightError("id contains an underscore or is all white spaces"));
		}
		if(!this.datasetContents.has(id)) {
			return Promise.reject(new NotFoundError("id has not been added yet"));
		}

		this.datasetContents.delete(id);
		this.idKindMapping.delete(id);
		fs.removeSync(persistDir + "/" + id);
		return Promise.resolve(id);
	}

	public performQuery(query: any): Promise<any[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}

	private saveToDisk(data: Map<string, any[]>, path: string): void {
		for (let [key, value] of data) {
			fs.outputJson(path + key + ".json", value, (err) => {
				if (err) {
					throw err;
				}
				console.log("JSON data is saved.");
			});
		}
		return;
	}
}
