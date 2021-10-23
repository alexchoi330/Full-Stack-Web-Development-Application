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

function parseOutBuildingCodeTd(nodes: parse5.ChildNode[]): parse5.ChildNode[] {
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
	return buildingCodeNodes;
}

function parseOutBuildingCodeFromTd(buildingCodeNodes: parse5.ChildNode[]): string[]{
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
	return codes;
}

export{DFS, saveToDisk, parseCourses, parseOutBuildingCodeTd, parseOutBuildingCodeFromTd};
