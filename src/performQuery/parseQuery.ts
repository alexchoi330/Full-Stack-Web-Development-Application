import {IInsightFacade, InsightError, NotFoundError} from "../controller/IInsightFacade";
import {greaterThan, lessThan, is, or, and, equalTo, not} from "./logic";
import {skeyCheck, mkeyCheck, courseIDCheck, numberCheck, quickSort,
	MSFieldHelper, MSFieldHelperReverse, fieldSorter} from "./parseQueryHelpers";

export enum Field {
	avg = "Avg",
	pass = "Pass",
	fail = "Fail",
	audit = "Audit",
	year = "Year",
	dept = "Subject",
	id = "Course",
	instructor = "Professor",
	title = "Title",
	uuid = "id",
	Avg = "avg",
	Pass = "pass",
	Fail = "fail",
	Audit = "audit",
	Year = "year",
	Subject = "dept",
	Course = "id",
	Professor = "instructor",
	Title = "title",
	// idTwo is bad don't use
	idTwo = "uuid",
	Section = "Section"
}


export function whereParse (datasetContents: any, datasetID: any, query: any): Map<string, any[]> {
	let orderArr = [];
	if (Object.keys(query)[0] === "IS"
		|| Object.keys(query)[0] === "GT"
		|| Object.keys(query)[0] === "LT"
		|| Object.keys(query)[0] === "EQ"){
		return MSComparisonHelper(datasetContents, datasetID, Object.keys(query)[0], query);
	} else if (Object.keys(query)[0] === "OR"
		|| Object.keys(query)[0] === "AND") {
		let values = Object.values(query)[0] as any[];
		for (let item of values) {
			orderArr.push(whereParse(datasetContents, datasetID, item));
		}
		return logicComparisonHelper(Object.keys(query)[0], orderArr);
	} else if (Object.keys(query)[0] === "NOT"){
		let notMap = whereParse(datasetContents, datasetID, Object.values(query)[0]);
		return not(datasetContents.get(datasetID) as Map<string, any[]>, notMap);
	} else {
		throw new InsightError("Unrecognizable key in WHERE");
	}
}

export function MSComparisonHelper (datasetContents: any, datasetID: any, key: string, query: any): Map<string, any[]> {
	let comparisonValue = Object.values(query)[0] as any;
	if (!(Object.keys(comparisonValue).length === 1)){
		throw new InsightError("Too many keys inside " + key);
	}
	let dsID = Object.keys(comparisonValue)[0] as string;
	let courseID = dsID.split("_", 1)[0];
	// this.currentDatasetID = courseID;
	if (!courseIDCheck(datasetContents, courseID, datasetID)) {
		throw new InsightError("Wrong courseID in base case");
	}
	let msKey = dsID.split("_", 2)[1];
	numberCheck(msKey, comparisonValue[dsID]);
	msKey = MSFieldHelper(msKey);
	if (key === "GT" || key === "EQ" || key === "LT") {
		if (!mkeyCheck(MSFieldHelperReverse(msKey))) {
			throw new InsightError("mkey incorrect in GT EQ LT");
		}
	}
	if (key === "IS") {
		if (!skeyCheck(MSFieldHelperReverse(msKey))) {
			throw new InsightError("skey incorrect in IS");
		}
		return is(datasetContents.get(courseID) as Map<string, any[]>,
			msKey, Object.values(comparisonValue)[0] as string);
	} else if (key === "GT") {
		return greaterThan(datasetContents.get(courseID) as Map<string, any[]>,
			msKey, Object.values(comparisonValue)[0] as number);
	} else if (key === "LT") {
		return lessThan(datasetContents.get(courseID) as Map<string, any[]>,
			msKey, Object.values(comparisonValue)[0] as number);
	} else if (key === "EQ") {
		return equalTo(datasetContents.get(courseID) as Map<string, any[]>,
			msKey, Object.values(comparisonValue)[0] as number);
	}
	throw new InsightError("should not be here");
}

export function logicComparisonHelper (key: string, queryList: Array<Map<string, any[]>>): Map<string, any[]> {
	if (key === "AND") {
		return and(queryList);
	} else if (key === "OR") {
		return or(queryList);
	}
	throw new InsightError("should not be here");
}

export function checkOptions (query: any): string {
	let orderBool = false;
	if (!(Object.prototype.hasOwnProperty.call(query, "COLUMNS"))) {
		throw new InsightError("COLUMNS not correct");
	} else if (Object.prototype.hasOwnProperty.call(query, "ORDER")) {
		orderBool = true;
	}
	if (Object.keys(query).length > 1 && !orderBool) {
		throw new InsightError("invalid key in OPTIONS");
	}
	let columns = query["COLUMNS"] as string[];
	let order = query["ORDER"] as any;
	let courseID = columns[0].split("_", 1)[0];
	// let checkColumns = [];
	for (const column in columns) {
		let courseIDTwo = columns[column].split("_", 1)[0];
		if (!(courseID === courseIDTwo)) {
			throw new InsightError("Wrong courseID in OPTIONS");
		}
		let msKey = columns[column].split("_", 2)[1];
		if (!(skeyCheck(msKey) || mkeyCheck(msKey))) {
			throw new InsightError("key inside COLUMNS is wrong");
		}
	}
	if (typeof order === "string" || order === undefined) {
		// checked already
	} else {
		if (!Object.prototype.hasOwnProperty.call(order, "dir") ||
			!Object.prototype.hasOwnProperty.call(order,"keys") ||
			Object.keys(order).length > 2) {
			throw new InsightError("dir/keys in object error");
		}
		if (order["dir"] !== "UP" && order["dir"] !== "DOWN") {
			throw new InsightError("dir value wrong");
		}
		for (let key in order["keys"]) {
			let keyTemp = order["keys"][key].split("_", 2)[1];
			if (!(skeyCheck(keyTemp) || mkeyCheck(keyTemp))) {
				throw new InsightError("key inside ORDER keys is wrong");
			}
		}
	}
	return courseID;
}

export function optionsSort (datasetContents: any, datasetID: any, query: any, data: Map<string,any[]>): any[] {
	let orderBool = false;
	if (Object.prototype.hasOwnProperty.call(query, "ORDER")) {
		orderBool = true;
	}
	let columns = query["COLUMNS"] as string[];
	let order = query["ORDER"] as any;
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
					let id = datasetID + "_" + MSFieldHelperReverse(key);
					let val = item[key];
					obj[id] = val;
				}
			}
			finalArr.push(obj);
		}
	}
	if (!orderBool) {
		console.log (finalArr);
		return finalArr;
	} else {
		return orderHelper(datasetContents, datasetID, order, finalArr);
	}
}

export function orderHelper (datasetContents: any, datasetID: any, order: any, data: any[]): any[] {
	if (typeof order === "string") {
		let courseID = order.split("_", 1)[0];
		if (!courseIDCheck(datasetContents, courseID, datasetID)) {
			throw new InsightError("courseID in order doesn't match");
		}
		if (!(typeof data[0][order] === "number" || typeof data[0][order] === "string")) {
			throw new InsightError("Order data doesn't make sense");
		}
		let temp = data;
		// console.log(temp);
		// console.log("After sort");
		quickSort(temp, order, 0, temp.length - 1, true);
		// console.log(temp);
		return temp;
	} else {
		for (let key in order["keys"]) {
			let courseID = order["keys"][key].split("_", 1)[0];
			if (!courseIDCheck(datasetContents, courseID, datasetID)) {
				throw new InsightError("courseID in order doesn't match");
			}
		}
		console.log(order);
		let ascend = true;
		if (order["dir"] === "UP") {
			ascend = true;
		} else if (order["dir"] === "DOWN") {
			ascend = false;
		}
		console.log(data);
		console.log("after sort");
		data.sort(fieldSorter(order["keys"], ascend));
		console.log(data);
		return data;
	}
}

export function transformationsSort (datasetContents: any, datasetID: any, query: any, data: any[]): any[] {
	if (!Object.prototype.hasOwnProperty.call(query, "GROUP") ||
		!Object.prototype.hasOwnProperty.call(query, "APPLY") ||
		query.keys().length > 2) {
		throw new InsightError("transformation missing GROUP or APPLY or too many arguments");
	}
	let group = query["GROUP"];
	let apply = query["APPLY"];
	let clone = [...data];
	let cloneArray = [clone];
	for (let key in group) {
		// loop through all elements of array to make groups and update the array
		console.log(group[key]);
		for (let x in cloneArray) {
			let result;
			for (let y in cloneArray[x]) {
				// taken from https://stackoverflow.com/questions/40774697/how-to-group-an-array-of-objects-by-key
				result = cloneArray[x][y].reduce(function
				(r: { [x: string]: any[]; }, a: { [x: string]: string | number; }) {
					r[a[group[key]]] = r[a[group[key]]] || [];
					r[a[group[key]]].push(a);
					return r;
				}, Object.create(null));
			}
			console.log(cloneArray);
		}
	}
	return [];
}


