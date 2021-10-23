import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";
import JSZip from "jszip";
import fs from "fs-extra";
import parse5, {Document} from "parse5";
import {persistDir} from "../../test/TestUtil";
import {DFS, saveToDisk, parseCourses} from "../addDataset/addDatasetHelpers";
// import {parseQuery} from "../performQuery/parseQuery";
import {not} from "../performQuery/logic";
import {
	Field, MSFieldHelper, MSFieldHelperReverse, MSComparisonHelper,
	skeyCheck, mkeyCheck, courseIDCheck, logicComparisonHelper, parseOptions, numberCheck, orderHelper
} from "../performQuery/parseQuery";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {

	private datasetContents;
	private datasetKind;
	private datasetSize;
	private persistDir = "./data";
	private currentDatasetID;

	constructor() {
		this.datasetContents =  new Map<string, Map<string, any[]>>();
		this.datasetKind = new Map<string, InsightDatasetKind>();
		this.datasetSize = new Map<string, number>();
		if(fs.existsSync(persistDir + "/" + InsightDatasetKind.Courses)) {
			this.loadFromDisk(InsightDatasetKind.Courses);
		}
		this.currentDatasetID = "";
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if(id.includes("_")
			|| this.datasetContents.has(id)
			|| !id.replace(/\s/g, "").length) {
			return Promise.reject(
				new InsightError("id is invalid, contains underscore, is all spaces or has already been added"));
		}
		if(kind === InsightDatasetKind.Courses) {
			await this.addCourse(id, content);
		} else if(kind === InsightDatasetKind.Rooms) {
			await this.addRoom(id, content);
		} else {
			return Promise.reject(new InsightError("Kind is not courses or rooms"));
		}
		// add dataset to hard disk
		saveToDisk(this.datasetContents.get(id) as Map<string, any[]>,
			this.persistDir + "/" + kind + "/" + id + "/");
		return Promise.resolve(Array.from(this.datasetContents.keys()));
	}

	private async addCourse(id: string, content: string): Promise<void>{
		const jsZip = new JSZip();
		let courses = new Map<string, any[]>();
		let size = 0;

		await jsZip.loadAsync(content, {base64: true});
		for (const filename of Object.keys(jsZip.files)) {
			let fileData = await jsZip.files[filename].async("string");
			try {
				let data = JSON.parse(fileData);
				let parsedData = parseCourses(data.result);
				size += parsedData.length;
				let coursePath = filename.split("/");
				// A valid course has to contain at least one valid course section
				if(parsedData.length !== 0) {
					courses.set(coursePath[coursePath.length - 1], parsedData);
				}
			} catch (e) {
				// do nothing
			}
		}
		// add dataset to our internal data structures
		this.datasetContents.set(id, courses);
		this.datasetKind.set(id, InsightDatasetKind.Courses);
		this.datasetSize.set(id, size);
	}

	private async addRoom(id: string, content: string): Promise<void>{
		const jsZip = new JSZip();
		let rooms = new Map<string, any[]>();
		let size = 0;

		// unzip the zip file and load the index.htm
		await jsZip.loadAsync(content, {base64: true});
		let indexPath = id + "/index.htm";
		let fileData = await jsZip.files[indexPath].async("string");
		let indexDocument: Document = parse5.parse(fileData);

		// get all the td elements
		let nodes: parse5.ChildNode[] = [];
		DFS(indexDocument.childNodes, "td", nodes);

		// parse out td for building code
		let buildingCodeNodes: parse5.ChildNode[] = [];
		for(let node of nodes) {
			if ("attrs" in node) {
				for(let attr of node.attrs) {
					if(attr.value === "views-field views-field-field-building-code") {
						buildingCodeNodes.push(node);
					}
				}
			}
		}

		// parse out all building codes
		let codes = [];
		for(let node of buildingCodeNodes) {
			if ("childNodes" in node) {
				for(let child of node.childNodes) {
					if(child.nodeName === "#text") {
						if ("value" in child) {
							codes.push(child.value.replace(/\s/g, ""));
						}
					}
				}
			}
		}

		// add dataset to our internal data structures
		this.datasetContents.set(id, rooms);
		this.datasetKind.set(id, InsightDatasetKind.Courses);
		this.datasetSize.set(id, size);
		return;
	}

	public removeDataset(id: string): Promise<string> {
		if(id.includes("_")
			|| !id.replace(/\s/g, "").length) {
			return Promise.reject(new InsightError("id contains an underscore or is all white spaces"));
		}
		if(!this.datasetContents.has(id)) {
			return Promise.reject(new NotFoundError("id has not been added yet"));
		}
		// delete key, value pair from corresponding maps
		this.datasetContents.delete(id);
		this.datasetKind.delete(id);
		this.datasetSize.delete(id);
		// remove from hard disk
		fs.removeSync(persistDir + "/" + id);
		return Promise.resolve(id);
	}

	public performQuery(query: any): Promise<any[]> {
		if (!(Object.prototype.hasOwnProperty.call(query, "WHERE")
			&& Object.prototype.hasOwnProperty.call(query, "OPTIONS"))) {
			return Promise.reject(new InsightError("WHERE or OPTIONS not correct"));
		}
		const whereObj = query["WHERE"];
		const optionObj = query["OPTIONS"];
		this.currentDatasetID = parseOptions(optionObj);
		let whereReturn;
		console.log(whereObj, optionObj);
		if (Object.keys(whereObj).length === 0) {
			this.currentDatasetID = optionObj["COLUMNS"][0].split("_", 1)[0];
			whereReturn = new Map(this.datasetContents.get(this.currentDatasetID) as Map<string, any[]>);
		} else if (Object.keys(whereObj).length > 1) {
			return Promise.reject(new InsightError("Too many objects in WHERE"));
		} else {
			whereReturn = this.whereParse(whereObj);
		}
		let totalReturn = 0;
		for (let item of whereReturn.values()) {
			totalReturn = totalReturn + item.length;
		}
		if (totalReturn > 5000) {
			throw new ResultTooLargeError("The query returns over 5000 results");
		}
		let optionsReturn = this.optionsSort(optionObj, whereReturn);
		return Promise.resolve(optionsReturn);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		let datasets = [];
		for (let [key] of this.datasetContents) {
			let dataset = {
				id: key,
				kind: this.datasetKind.get(key),
				numRows: this.datasetSize.get(key),
			};
			datasets.push(dataset);
		}
		return Promise.resolve(datasets as InsightDataset[]);
	}

	private loadFromDisk(kind: InsightDatasetKind): void {
		try {
			fs.readdir(persistDir + "/" + kind, (err, courseIDs) => {
				courseIDs.forEach(async (courseID, index) => {
					let size = 0;
					let courses = new Map<string, any[]>();
					let coursesNames = await fs.readdir(persistDir + "/" + kind + "/" + courseID);
					for (let courseName of coursesNames) {
						let courseJson = await fs.readJson(persistDir + "/" + kind + "/" + courseID + "/" + courseName);
						courses.set(courseName.split(".").slice(0, -1).join("."), courseJson);
						size += courseJson.length;
					}
					// add dataset to our internal data structures
					this.datasetContents.set(courseID, courses);
					this.datasetSize.set(courseID, size);
					this.datasetKind.set(courseID, kind);
				});
			});
		} catch (e) {
			console.log("Something happened when reading the disk");
		}
		return;
	}

	private whereParse (query: any): Map<string, any[]> {
		let orderArr = [];
		if (Object.keys(query)[0] === "IS"
			|| Object.keys(query)[0] === "GT"
			|| Object.keys(query)[0] === "LT"
			|| Object.keys(query)[0] === "EQ"){
			return MSComparisonHelper(this.datasetContents, this.currentDatasetID, Object.keys(query)[0], query);
		} else if (Object.keys(query)[0] === "OR"
			|| Object.keys(query)[0] === "AND") {
			let values = Object.values(query)[0] as any[];
			for (let item of values) {
				orderArr.push(this.whereParse(item));
			}
			return logicComparisonHelper(Object.keys(query)[0], orderArr);
		} else if (Object.keys(query)[0] === "NOT"){
			let notMap = this.whereParse(Object.values(query)[0]);
			return not(this.datasetContents.get(this.currentDatasetID) as Map<string, any[]>, notMap);
		} else {
			throw new InsightError("Unrecognizable key in WHERE");
		}
	}

	private optionsSort (query: any, data: Map<string,any[]>): any[] {
		let orderBool = false;
		if (Object.prototype.hasOwnProperty.call(query, "ORDER")) {
			orderBool = true;
		}
		let columns = query["COLUMNS"] as string[];
		let order = query["ORDER"] as string;
		let checkColumns = [];
		for (const column in columns) {
			let msKey = columns[column].split("_", 2)[1];
			checkColumns.push(MSFieldHelper(msKey));
		}
		let tempData = new Map(data);
		let finalArr = [];
		for (let value of tempData.values()) {
			for (let item of value) {
				let obj = {} as any;
				for (let key of Object.keys(item)) {
					if (checkColumns.indexOf(key) > -1) {
						let id = this.currentDatasetID + "_" + MSFieldHelperReverse(key);
						let val = item[key];
						obj[id] = val;
					}
				}
				finalArr.push(obj);
			}
		}
		if (!orderBool) {
			// console.log (finalArr);
			return finalArr;
		} else {
			return orderHelper(this.datasetContents, this.currentDatasetID, order, finalArr);
		}
	}
}
