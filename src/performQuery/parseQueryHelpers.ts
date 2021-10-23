import {InsightError} from "../controller/IInsightFacade";
import {and, or} from "./logic";


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

export function skeyCheck(skey: string): boolean{
	let validKeys = ["dept", "id", "instructor", "title", "uuid"];
	return validKeys.includes(skey);
}

export function mkeyCheck(mkey: string): boolean{
	let validKeys = ["avg", "pass", "fail", "audit", "year"];
	return validKeys.includes(mkey);
}

export function courseIDCheck(datasets: Map<string, Map<string,any[]>>, id: string, currentID: string): boolean {
	return datasets.has(id) && id === currentID;
}

export function numberCheck(id: string, field: any): void {
	if (id === "avg" || id === "pass" || id === "fail" || id === "audit" || id === "year") {
		if (!(typeof field === "number")) {
			throw new InsightError("field is not a number when it should be");
		}
	}
}

function swapTwo (arr: any[],objOne: number, objTwo: number) {
	let temp = arr[objOne];
	arr[objOne] = arr[objTwo];
	arr[objTwo] = temp;
}

// implement quicksort for both
export function quickSort(arr: any[], key: string, start: number, end: number, ascend: boolean) {
	if (start < end) {
		let mid = partition(arr, key, start, end, ascend);
		quickSort(arr, key, start, mid - 1, ascend);
		quickSort(arr, key, mid + 1, end, ascend);
	}
}

function partition(arr: any[], key: string, start: number, end: number, ascend: boolean): number {
	// let msKey = key.split("_", 1)[0];
	let msKey = key.split("_", 2)[1];
	let pivot = arr[end][key];
	let previous = start - 1;
	for (let i = start; i < end; i++) {
		if (ascend) {
			// if (mkeyCheck(msKey)) {
			if (arr[i][key] < pivot) {
				previous++;
				swapTwo(arr, previous, i);
			}
			// } else if (skeyCheck(msKey)) {
				// if (arr[i][key].localeCompare(pivot) <= -1) {
				// if (arr[i][key] < pivot) {
					// previous++;
					// swapTwo(arr, previous, i);
				// }
			// } else {
			// 	throw new InsightError("quick sort shouldn't be here");
			// }
		} else {
			// if (mkeyCheck(msKey)) {
			if (arr[i][key] > pivot) {
				previous++;
				swapTwo(arr, previous, i);
			}
			// } else if (skeyCheck(msKey)) {
				// if (arr[i][key].localeCompare(pivot) > -1) {
				// if (arr[i][key] > pivot) {
					// previous++;
					// swapTwo(arr, previous, i);
				// }
			// } else {
			// 	throw new InsightError("quick sort shouldn't be here");
			// }
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
					// o=o.substring(1);
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

