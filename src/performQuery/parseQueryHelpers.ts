import {InsightError} from "../controller/IInsightFacade";
import {and, or} from "./logic";
import Decimal from "decimal.js";


export function MSFieldHelper (field: string): string {
	let rms = ["fullname", "shortname", "number", "name", "address", "lat",
		"lon", "seats", "type", "furniture", "href"];
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
	} else if (rms.includes(field)) {
		return field;
	} else {
		return "BAD ID";
	}
}

export function MSFieldHelperReverse (field: string): string {
	let rms = ["fullname", "shortname", "number", "name", "address", "lat",
		"lon", "seats", "type", "furniture", "href"];
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
	} else if (rms.includes(field)) {
		return field;
	} else {
		return "BAD ID";
	}
}

export function skeyCheck(skey: string): boolean{
	let validKeys = ["dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number", "name", "address",
		"type", "furniture", "href"];
	return validKeys.includes(skey);
}

export function mkeyCheck(mkey: string): boolean{
	let validKeys = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
	return validKeys.includes(mkey);
}

export function courseIDCheck(datasets: Map<string, Map<string,any[]>>, id: string, currentID: string): boolean {
	return datasets.has(id) && id === currentID;
}

export function numberCheck(id: string, field: any): void {
	if (id === "avg" || id === "pass" || id === "fail" || id === "audit" || id === "year" ||
		id === "lat" || id === "lon" || id === "seats") {
		if (!(typeof field === "number")) {
			throw new InsightError("field is not a number when it should be");
		}
	}
}

export function applyCheck(apply: any, datasetID: any, result: any[]) {
	let applyKeyRule: string[] = [];
	for (let a in apply) {
		let applyKey = Object.keys(apply[a])[0] as string;
		if (Object.keys(apply[a]).length > 1) {
			throw new InsightError("Too many keys inside APPLY");
		}
		let insideObj = Object.values(apply[a])[0] as any;
		if (Object.keys(insideObj).length > 1) {
			throw new InsightError("Too many keys inside APPLY INNER OBJECT");
		}
		if (!Object.prototype.hasOwnProperty.call(insideObj, "MAX") &&
			!Object.prototype.hasOwnProperty.call(insideObj, "MIN") &&
			!Object.prototype.hasOwnProperty.call(insideObj, "SUM") &&
			!Object.prototype.hasOwnProperty.call(insideObj, "COUNT") &&
			!Object.prototype.hasOwnProperty.call(insideObj, "AVG")) {
			throw new InsightError("APPLYTOKEN is wrong");
		}
		let IDKey = Object.values(insideObj)[0] as string;
		let ID = IDKey.split("_", 1)[0];
		let key = IDKey.split("_", 2)[1];
		if (Object.keys(insideObj)[0] === "MAX" || Object.keys(insideObj)[0] === "MIN" ||
			Object.keys(insideObj)[0] === "SUM" || Object.keys(insideObj)[0] === "AVG") {
			if (!mkeyCheck(key)) {
				throw new InsightError("MAX MIN SUM AVG key is not a number");
			}
		}
		if (!(skeyCheck(key) || mkeyCheck(key))) {
			throw new InsightError("key inside APPLYTOKEN is wrong");
		}
		if (!(ID === datasetID)) {
			throw new InsightError("datasetID wrong inside APPLY");
		}
		if (applyKeyRule.includes(applyKey)) {
			throw new InsightError("APPLYKEY in APPLYRULE should be unique");
		}
		applyKeyRule.push(applyKey);
		result.push(Object.values(insideObj)[0]);
		result.push(Object.keys(apply[a])[0]);
	}
}

function swapTwo (arr: any[],objOne: number, objTwo: number) {
	let temp = arr[objOne];
	arr[objOne] = arr[objTwo];
	arr[objTwo] = temp;
}

export function quickSort(arr: any[], key: string, start: number, end: number, ascend: boolean) {
	if (start < end) {
		let mid = partition(arr, key, start, end, ascend);
		quickSort(arr, key, start, mid - 1, ascend);
		quickSort(arr, key, mid + 1, end, ascend);
	}
}

function partition(arr: any[], key: string, start: number, end: number, ascend: boolean): number {
	let pivot = arr[end][key];
	let previous = start - 1;
	for (let i = start; i < end; i++) {
		if (ascend) {
			if (arr[i][key] < pivot) {
				previous++;
				swapTwo(arr, previous, i);
			}
		} else {
			if (arr[i][key] > pivot) {
				previous++;
				swapTwo(arr, previous, i);
			}
		}
	}
	swapTwo(arr, previous + 1, end);
	return (previous + 1);
}

// function fieldSorter taken from https://stackoverflow.com/questions/6913512/how-to-sort-an-array-of-objects-by-multiple-fields?page=1&tab=votes#tab-top
export function fieldSorter(fields: any[], ascend: boolean) {
	return function (a: { [x: string]: number; }, b: { [x: string]: number; }) {
		return fields
			.map(function (o) {
				let dir = 1;
				if (!ascend) {
					dir = -1;
				}
				if (a[o] > b[o]) {
					return dir;
				}
				if (a[o] < b[o]) {
					return -(dir);
				}
				return 0;
			})
			.reduce(function firstNonZeroValue (p,n) {
				return p ? p : n;
			}, 0);
	};
}

export function groupApply(clone: any[], keys: any[], apply: any[]) {
	// taken from https://stackoverflow.com/questions/46794232/group-objects-by-multiple-properties-in-array-then-sum-up-their-values
	const result = clone.reduce((r, o) => {
		let value = o[keys[0]];
		if (keys.length > 1) {
			for (let k = 1; k < keys.length; k++) {
				value = value + "-" + o[keys[k]];
			}
		}
		const item = r.get(value) || o;
		applyHelper(apply, item, o, keys);
		return r.set(value, item);
	}, new Map()).values();
	let array = [...result];
	return array;
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
		quickSort(temp, order, 0, temp.length - 1, true);
		return temp;
	} else {
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

function applyHelper(apply: any[], item: any, o: any, groupKeys: any[]) {
	for (let a in apply) {
		// console.log(apply[a]);
		let key = Object.keys(apply[a])[0], valueIns = Object.values(apply[a])[0] as any;
		// console.log (Object.values(valueIns)[0]);
		// console.log(key);
		// console.log(item);
		checkApplyNumber(Object.keys(valueIns)[0] as string, Object.values(valueIns)[0] as string);
		minMaxSumCountAvg(valueIns, key, item, o);
	}
}

function minMaxSumCountAvg(valueIns: any, key: any, item: any, o: any) {
	if (Object.keys(valueIns)[0] === "MAX") {
		if (key in item) {
			if (item[key] < o[Object.values(valueIns)[0] as string]) {
				item[key] = o[Object.values(valueIns)[0] as string];
			}
		} else {
			item[key] = o[Object.values(valueIns)[0] as string];
		}
	} else if (Object.keys(valueIns)[0] === "MIN") {
		if (key in item) {
			if (item[key] > o[Object.values(valueIns)[0] as string]) {
				item[key] = o[Object.values(valueIns)[0] as string];
			}
		} else {
			item[key] = o[Object.values(valueIns)[0] as string];
		}
	} else if (Object.keys(valueIns)[0] === "SUM") {
		if (key in item) {
			item[key] = item[key] + o[Object.values(valueIns)[0] as string];
			item[key] = Number(item[key].toFixed(2));
		} else {
			item[key] = o[Object.values(valueIns)[0] as string];
		}
	} else if (Object.keys(valueIns)[0] === "COUNT") {
		if (key in item) {
			if (!item["COUNTARRAY"].includes(o[Object.values(valueIns)[0] as string])) {
				item[key] = item[key] + 1;
				item["COUNTARRAY"].push(o[Object.values(valueIns)[0] as string]);
			}
		} else {
			item[key] = 1;
			item["COUNTARRAY"] = [o[Object.values(valueIns)[0] as string]];
		}
	} else if (Object.keys(valueIns)[0] === "AVG") {
		if (key in item) {
			item["COUNTAVG"] = item["COUNTAVG"] + 1;
			item["TOTALAVG"] = Decimal.add(item["TOTALAVG"], new Decimal(o[Object.values(valueIns)[0] as string]));
			item[key] = item["TOTALAVG"].toNumber() / item["COUNTAVG"];
			item[key] = Number(item[key].toFixed(2));
		} else {
			item["COUNTAVG"] = 1;
			item["TOTALAVG"] = new Decimal(o[Object.values(valueIns)[0] as string]);
			item[key] = item["TOTALAVG"].toNumber() / item["COUNTAVG"];
		}
	}
}

function checkApplyNumber (key: string, value: string) {
	if (key === "MAX" || key === "MIN" || key === "AVG" || key === "SUM") {
		let valueT = key.split("_", 2)[1];
		mkeyCheck(valueT);
	}
}
