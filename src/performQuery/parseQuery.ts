import {IInsightFacade, InsightError, NotFoundError, ResultTooLargeError} from "../controller/IInsightFacade";
import {greaterThan, lessThan, is, or, and, equalTo, not} from "./logic";
import {skeyCheck, mkeyCheck, courseIDCheck, numberCheck,
	MSFieldHelper, MSFieldHelperReverse, groupApply, orderHelper, applyCheck} from "./parseQueryHelpers";

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

function getCourseID(columns: string[]): string {
	for (const column in columns) {
		// console.log(columns[column]);
		if (columns[column].includes("_")) {
			return columns[column].split("_", 1)[0];
		}
	}
	return "";
}


export function checkOptions (query: any, names: any[]): string {
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
	let courseID = getCourseID(columns);
	// console.log(courseID);
	for (const column in columns) {
		if (names.length !== 0 && !names.includes(columns[column])) {
			throw new InsightError("column name is not in transformations");
		}
		let courseIDTwo = columns[column].split("_", 1)[0];
		if (!(courseID === courseIDTwo) && !(names.includes(columns[column])) && names.length > 0) {
			throw new InsightError("Wrong courseID in OPTIONS");
		}
		let msKey = columns[column].split("_", 2)[1];
		if (!(skeyCheck(msKey) || mkeyCheck(msKey)) && !(names.includes(columns[column])) && names.length > 0) {
			throw new InsightError("key inside COLUMNS is wrong");
		}
	}
	if (typeof order === "string" || order === undefined) {
		// checked already
	} else {
		if (!Object.prototype.hasOwnProperty.call(order, "dir") ||
			!Object.prototype.hasOwnProperty.call(order,"keys") || Object.keys(order).length > 2) {
			throw new InsightError("dir/keys in object error");
		}
		if (order["dir"] !== "UP" && order["dir"] !== "DOWN") {
			throw new InsightError("dir value wrong");
		}
		for (let key in order["keys"]) {
			let courseTemp = order["keys"][key].split("_", 1)[0];
			let keyTemp = order["keys"][key].split("_", 2)[1];
			if (courseTemp !== courseID && !(names.includes(order["keys"][key])) && names.length > 0) {
				throw new InsightError("course id inside ORDER keys is wrong");
			}
			if (!(skeyCheck(keyTemp) || mkeyCheck(keyTemp)) && !(names.includes(order["keys"][key])) &&
				names.length > 0) {
				throw new InsightError("key inside ORDER keys is wrong");
			}
		}
	}
	return courseID;
}

export function optionsSort (datasetContents: any, datasetID: any,
	query: any, data: Map<string,any[]>, apply: any[]): any[] {
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
	for (const column in apply) {
		let msKey = apply[column].split("_", 2)[1];
		checkColumns.push(msKey);
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

export function checkTransformations (datasetContents: any, datasetID: any, query: any): any[] {
	if (!Object.prototype.hasOwnProperty.call(query, "GROUP") ||
		!Object.prototype.hasOwnProperty.call(query, "APPLY") ||
		Object.keys(query).length > 2) {
		throw new InsightError("transformation missing GROUP or APPLY or too many arguments");
	}
	let group = query["GROUP"];
	let apply = query["APPLY"];
	let result = [];
	for (let g in group) {
		let ID = group[g].split("_", 1)[0];
		let key = group[g].split("_", 2)[1];
		if (!(ID === datasetID)) {
			throw new InsightError("datasetID wrong inside GROUP");
		}
		if (!(skeyCheck(key) || mkeyCheck(key))) {
			throw new InsightError("key inside GROUP is wrong");
		}
		result.push(group[g]);
	}
	applyCheck(apply, datasetID, result);
	console.log(result);
	return result;
}

export function transformationsSort (datasetContents: any, datasetID: any, query: any, data: any[]): any[] {
	let group = query["GROUP"];
	let apply = query["APPLY"];
	let clone = [...data];
	let keys = [group[0]];
	if (group.length > 1) {
		for (let i = 1; i < group.length; i++) {
			keys.push(group[i]);
		}
	}
	let array = groupApply(clone, keys, apply);
	console.log(array);
	if (array.length > 5000) {
		throw new InsightError("Return size over 5000 with transformation obj");
	}
	return array;
}

export function transformationsOptions(datasetContents: any, datasetID: any, query: any, data: any[]): any[] {
	let orderBool = false;
	if (Object.prototype.hasOwnProperty.call(query, "ORDER")) {
		orderBool = true;
	}
	let columns = query["COLUMNS"] as string[];
	let order = query["ORDER"] as any;
	let tempData = [...data];
	let finalArr = [];
	console.log(columns);
	for (let value of tempData) {
		let obj = {} as any;
		for (let key of Object.keys(value)) {
			if (columns.indexOf(key) > -1) {
				obj[key] = value[key];
			}
		}
		finalArr.push(obj);
	}
	if (!orderBool) {
		console.log (finalArr);
		return finalArr;
	} else {
		return orderHelper(datasetContents, datasetID, order, finalArr);
	}
}

export function checkSize(whereReturn: Map<string, any[]>) {
	let totalReturn = 0;
	for (let item of whereReturn.values()) {
		totalReturn = totalReturn + item.length;
	}
	if (totalReturn > 5000) {
		throw new ResultTooLargeError("The query returns over 5000 results");
	}
}

export function columnCheck(transformationsQuery: any): any[] {
	let group = transformationsQuery["GROUP"];
	let apply = transformationsQuery["APPLY"];
	let result = [];
	for (let g in group) {
		result.push(group[g]);
	}
	for (let a in apply) {
		result.push(Object.keys(apply[a])[0]);
	}
	return result;
}
