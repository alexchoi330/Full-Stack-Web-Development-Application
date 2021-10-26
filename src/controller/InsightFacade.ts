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
import {
	DFS, saveToDisk, parseCourses, parse_Out_Td_Based_Off_Attribute,
	parseOutDataFromText, parseRooms, parseOutDataFromHyperlink
} from "../addDataset/addDatasetHelpers";
import {
	checkOptions, optionsSort, whereParse
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

		// parse out building information tds'
		let buildingCodeNodes = parse_Out_Td_Based_Off_Attribute(nodes,"views-field views-field-field-building-code");
		let buildingFullNameNodes = parse_Out_Td_Based_Off_Attribute(nodes,"views-field views-field-title");
		let buildingAdrNodes = parse_Out_Td_Based_Off_Attribute(nodes,"views-field views-field-field-building-address");

		// parse out all building information from td
		let codes = parseOutDataFromText(buildingCodeNodes);
		let buildingFullNames = parseOutDataFromHyperlink(buildingFullNameNodes);
		let buildingAddresses = parseOutDataFromText(buildingAdrNodes);

		for (let i in codes) {
			let buildingPath = id + "/campus/discover/buildings-and-classrooms/" + codes[i];
			let buildingData = await jsZip.files[buildingPath].async("string");
			let buildingDocument: Document = parse5.parse(buildingData);
			let buildingJSONs = parseRooms(buildingDocument, codes[i], buildingFullNames[i], buildingAddresses[i]);
			for(let buildingJSON of buildingJSONs) {
				let building = rooms.get(codes[i]) as any[];
				if(building !== undefined) {
					building.push(buildingJSON);
				} else {
					building = [];
					building.push(buildingJSON);
				}
				rooms.set(codes[i], building);
				size += 1;
			}
		}

		// add dataset to our internal data structures
		this.datasetContents.set(id, rooms);
		this.datasetKind.set(id, InsightDatasetKind.Rooms);
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
		console.log(whereObj, optionObj);
		let transformationsObj = {};
		if ("TRANSFORMATIONS" in query) {
			transformationsObj = query["TRANSFORMATIONS"];
			console.log(transformationsObj);
		}
		this.currentDatasetID = checkOptions(optionObj);
		let whereReturn;
		if (Object.keys(whereObj).length === 0) {
			this.currentDatasetID = optionObj["COLUMNS"][0].split("_", 1)[0];
			whereReturn = new Map(this.datasetContents.get(this.currentDatasetID) as Map<string, any[]>);
		} else if (Object.keys(whereObj).length > 1) {
			return Promise.reject(new InsightError("Too many objects in WHERE"));
		} else {
			whereReturn = whereParse(this.datasetContents, this.currentDatasetID, whereObj);
		}
		let totalReturn = 0;
		for (let item of whereReturn.values()) {
			totalReturn = totalReturn + item.length;
		}
		if (totalReturn > 5000) {
			throw new ResultTooLargeError("The query returns over 5000 results");
		}
		let optionsReturn = optionsSort(this.datasetContents, this.currentDatasetID, optionObj, whereReturn);
		// transformationsSort(this.datasetContents, this.currentDatasetID, transformationObj, optionsReturn);
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

}
