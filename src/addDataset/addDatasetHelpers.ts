import parse5 from "parse5";
import fs from "fs-extra";
import {Field} from "../performQuery/parseQuery";

function DFS(Tree: parse5.ChildNode[], DOM: string, tableData: parse5.ChildNode[]): void{
	for(let child of Tree) {
		if(child.nodeName === DOM) {
			tableData.push(child);
		}
		if ("childNodes" in child) {
			DFS(child.childNodes, DOM, tableData);
		}
	}
}

function saveToDisk(data: Map<string, any[]>, path: string): void {
	for (let [key, value] of data) {
		fs.outputJson(path + key + ".json", value, (err) => {
			if (err) {
				throw err;
			}
		// console.log("JSON data is saved."); // commented out to run tests
		});
	}
	return;
}

function parseCourses(course: any[]): any[] {
	let result = [];
	if(course.length === 0) {
		return [];
	}
	for (let section of course) {
		// If the "Section" property in the source data is set to "overall", you should set the year for that section to 1900.
		if(section[Field.Section] === "overall") {
			section[Field.year] = 1900;
		}
		// If any of the property in the source data is not present at all, skip the section
		if(section[Field.dept] == null || section[Field.id] == null || section[Field.avg] == null
			|| section[Field.instructor] == null || section[Field.title] == null
			|| section[Field.pass] == null || section[Field.fail] == null
			|| section[Field.audit] == null || section[Field.uuid] == null
			|| section[Field.year] == null) {
			continue;
		}
		// Change UUID to string
		section[Field.uuid] = section[Field.uuid].toString();
		result.push(section);
	}
	return result;
}

export{DFS, saveToDisk, parseCourses};
