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
