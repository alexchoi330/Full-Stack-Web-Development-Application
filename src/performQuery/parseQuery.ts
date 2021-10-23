import {IInsightFacade, InsightError, NotFoundError} from "../controller/IInsightFacade";
import {greaterThan, lessThan, is, or, and, equalTo} from "./logic";

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

export function MSFieldHelper (field: string): string {
	if (field === "avg") {
		return "Avg";
	} else if  (field === "pass") {
		return "Pass";
	} else if (field === "fail") {
		return "Fail";
	} else if (field === "audit") {
		return "Audit";
	} else if (field === "year") {
		return "Year";
	} else if (field === "dept") {
		return "Subject";
	} else if (field === "id") {
		return "Course";
	} else if (field === "instructor") {
		return "Professor";
	} else if (field === "title") {
		return "Title";
	} else if (field === "uuid") {
		return "id";
	} else {
		return "BAD ID";
	}
}

export function MSFieldHelperReverse (field: string): string {
	if (field === "Avg") {
		return "avg";
	} else if  (field === "Pass") {
		return "pass";
	} else if (field === "Fail") {
		return "fail";
	} else if (field === "Audit") {
		return "audit";
	} else if (field === "Year") {
		return "year";
	} else if (field === "Subject") {
		return "dept";
	} else if (field === "Course") {
		return "id";
	} else if (field === "Professor") {
		return "instructor";
	} else if (field === "Title") {
		return "title";
	} else if (field === "id") {
		return "uuid";
	} else {
		return "BAD ID";
	}
}

export function numberCheck(id: string, field: any): void {
	if (id === "avg" || id === "pass" || id === "fail" || id === "audit" || id === "year") {
		if (!(typeof field === "number")) {
			throw new InsightError("field is not a number when it should be");
		}
	}
}

export function swapTwo (arr: any[],objOne: number, objTwo: number) {
	let temp = arr[objOne];
	arr[objOne] = arr[objTwo];
	arr[objTwo] = temp;
}

// implement quicksort for both
function quickSort(arr: any[], key: string, start: number, end: number) {
	if (start < end) {
		let mid = partition(arr, key, start, end);
		quickSort(arr, key, start, mid - 1);
		quickSort(arr, key, mid + 1, end);
	}
}

function partition(arr: any[], key: string, start: number, end: number): number {
	// let msKey = key.split("_", 1)[0];
	let msKey = key.split("_", 2)[1];
	let pivot = arr[end][key];
	let previous = start - 1;
	for (let i = start; i < end; i++) {
		if (mkeyCheck(msKey)) {
			if (arr[i][key] < pivot) {
				previous++;
				swapTwo(arr, previous, i);
			}
		} else if (skeyCheck(msKey)) {
			if (arr[i][key].localeCompare(pivot) <= -1) {
				previous++;
				swapTwo(arr, previous, i);
			}
		} else {
			throw new InsightError("quick sort shouldn't be here");
		}
	}
	swapTwo(arr, previous + 1, end);
	return (previous + 1);
}


export function skeyCheck(skey: string): boolean{
	let validKeys = ["dept", "id", "instructor", "title", "uuid"];
	return validKeys.includes(skey);
}

export function mkeyCheck(mkey: string): boolean{
	let validKeys = ["avg", "pass", "fail", "audit", "year"];
	return validKeys.includes(mkey);
}

export function courseIDCheck(datasets: Map<string, Map<string,any[]>>, id: string, currentID: string): boolean {
	if (!(datasets.has(id) && id === currentID)) {
		return false;
	} else {
		return true;
	}
}

export function logicComparisonHelper (key: string, queryList: Array<Map<string, any[]>>): Map<string, any[]> {
	if (key === "AND") {
		return and(queryList);
	} else if (key === "OR") {
		return or(queryList);
	}
	throw new InsightError("should not be here");
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

export function parseOptions (query: any): string {
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
	let order = query["ORDER"] as string;
	let courseID = columns[0].split("_", 1)[0];
	let checkColumns = [];
	for (const column in columns) {
		let courseIDTwo = columns[column].split("_", 1)[0];
		if (!(courseID === courseIDTwo)) {
			throw new InsightError("Wrong courseID in OPTIONS");
		}
		let msKey = columns[column].split("_", 2)[1];
		if (!(skeyCheck(msKey) || mkeyCheck(msKey))) {
			throw new InsightError("key inside ORDER is wrong");
		}
		checkColumns.push(MSFieldHelper(msKey));
	}
	return courseID;
}

export function orderHelper (datasetContents: any, datasetID: any, key: string, data: any[]): any[] {
	let courseID = key.split("_", 1)[0];
	if (!courseIDCheck(datasetContents, courseID, datasetID)) {
		throw new InsightError("courseID in order doesn't match");
	}
	if (!(typeof data[0][key] === "number" || typeof  data[0][key] === "string")) {
		throw new InsightError("Order data doesn't make sense");
	}
	let temp = data;
	quickSort(temp, key,0, temp.length - 1);
	return temp;
}

