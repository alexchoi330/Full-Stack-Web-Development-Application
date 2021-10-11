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

export function swap (arr: any[],objOne: number, objTwo: number): any[] {
	let temp = arr[objOne];
	arr[objOne] = arr[objTwo];
	arr[objTwo] = temp;
	return arr;
}

// using selection sort for numbers
export function selectionSortN(arr: any[], query: string, n: number): any[] {
	let temp = arr;
	for (let i = 0; i < n - 1; i++) {
		let index = i;
		for (let j = i + 1; j < n; j++) {
			if (temp[j][query] < temp[index][query]) {
				index = j;
			}
		}
		temp = swap(temp, index, i);
	}
	return temp;
}

// using bubble sort for strings
export function selectionSortS(arr: any[], query: string, n: number): any[] {
	let temp = arr;
	for (let i = 0; i < n - 1; i++) {
		for (let j = 0; j < n - i - 1; j++) {
			if (temp[j][query].localeCompare(temp[j + 1][query]) > -1) {
				temp = swap(temp, j, j + 1);
			}
		}
	}
	return temp;
}
//
//
// export function parseQuery (query: any): Promise<any[]> {
// 	if (!(Object.prototype.hasOwnProperty.call(query, "WHERE")
// 		&& Object.prototype.hasOwnProperty.call(query, "OPTIONS"))) {
// 		return Promise.reject(new InsightError("WHERE or OPTIONS not correct"));
// 	}
// 	console.log("made past first check");
// 	const whereObj = query["WHERE"];
// 	const optionObj = query["OPTIONS"];
// 	console.log(whereObj, optionObj);
// 	if (Object.keys(whereObj).length === 0) {
// 		return Promise.resolve([]);
// 	} else if (Object.keys(whereObj).length > 1) {
// 		return Promise.reject(new InsightError("Too many objects in WHERE"));
// 	}
// 	console.log(recursiveAppend(whereObj));
// 	return Promise.resolve(recursiveAppend(whereObj));
// }
//
// function recursiveAppend (query: any): Promise<any[]> {
// 	let orderArr = [];
// 	console.log("object keys:");
// 	console.log (Object.keys(query));
// 	if (Object.keys(query)[0] === "IS"){
// 		return Promise.resolve(is());
// 	} else if (Object.keys(query)[0] === "GT") {
//
// 	} else if (Object.keys(query)[0] === "LT") {
//
// 	} else if (Object.keys(query)[0] === "EQ") {
// 		return Promise.resolve(Object.keys(query));
// 	// }
// 	// else if (Object.keys(query)[0] === "NOT") {
// 	// 	for (let item in query["NOT"]) {
// 	// 		orderArr.push(recursiveAppend(item));
// 	// 	}
// 	// 	// orderArr.push(recursiveAppend(Object.keys(query)));
// 	// 	// return orderArr
// 	// } else if (Object.keys(query)[0] === "AND") {
// 	// 	for (let item in query["AND"]) {
// 	// 		orderArr.push(recursiveAppend(item));
// 	// 	}
// 	} else if (Object.keys(query)[0] === "OR"
// 				|| Object.keys(query)[0] === "AND"
// 				|| Object.keys(query)[0] === "NOT") {
// 		console.log("in or and not");
// 		// console.log(Object.values(query));
// 		console.log(Object.values(query)[0]);
// 		let values = Object.values(query)[0] as any[];
// 		for (let item of values) {
// 			console.log(item);
// 			orderArr.push(recursiveAppend(item));
// 		}
// 	} else {
// 		return Promise.reject(new InsightError("Unrecognizable key in WHERE"));
// 	}
// 	console.log("recursion");
// 	console.log(orderArr);
// 	return Promise.resolve(orderArr);
// }
// to do: keep testing the list return by creating a new folder to place json files so i can test queries

