import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import JSZip from "jszip";
/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {

	private datasetContents;
	private persistDir = "./data";

	constructor() {
		this.datasetContents =  new Map<string, Map<string, any[]>>();
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
		this.datasetContents.set(id, new Map<string, any[]>());

		await jsZip.loadAsync(content, {base64: true});
		for (const filename of Object.keys(jsZip.files)) {
			let fileData = await jsZip.files[filename].async("string");
			try {
				let data = JSON.parse(fileData);
				courseSections.set(filename, data);
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
		return Promise.resolve(Array.from(this.datasetContents.keys()));
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: any): Promise<any[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
