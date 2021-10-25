import parse5, {Document} from "parse5";
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
		// Change courses_uuid to string and courses_year to number
		section[Field.uuid] = section[Field.uuid].toString();
		section[Field.year] = Number(section[Field.year]);
		result.push(section);
	}
	return result;
}

// given a list of td, parse out td based off of attribute
function parse_Out_Td_Based_Off_Attribute(nodes: parse5.ChildNode[], attribute: string): parse5.ChildNode[] {
	let buildingCodeNodes: parse5.ChildNode[] = [];
	for(let node of nodes) {
		if ("attrs" in node) {
			for(let attr of node.attrs) {
				if(attr.value === attribute) {
					buildingCodeNodes.push(node);
				}
			}
		}
	}
	return buildingCodeNodes;
}

function parseOutDataFromText(buildingCodeNodes: parse5.ChildNode[]): string[]{
	let data = [];
	for(let node of buildingCodeNodes) {
		if ("childNodes" in node) {
			for(let child of node.childNodes) {
				if(child.nodeName === "#text") {
					if ("value" in child) {
						data.push(child.value.trim());
					}
				}
			}
		}
	}
	return data;
}

function parseOutDataFromHyperlink(buildingCodeNodes: parse5.ChildNode[]): string[]{
	let data = [];
	for(let node of buildingCodeNodes) {
		if ("childNodes" in node) {
			for(let child of node.childNodes) {
				if(child.nodeName === "a") {
					if ("childNodes" in child) {
						for(let child2 of child.childNodes) {
							if ("value" in child2) {
								data.push(child2.value.trim());
							}
						}
					}
				}
			}
		}
	}
	return data;
}

function parseRooms(buildingDocument: Document, BuildingShortName: string,
	BuildingFullName: string, BuildingAdr: string): any[] {
	let roomJsons = [];
	let data: parse5.ChildNode[] = [];

	// grab all the td elements from a building
	DFS(buildingDocument.childNodes, "td", data);

	// grab all the room numbers from a building
	let roomNumbersTD = parse_Out_Td_Based_Off_Attribute(data, "views-field views-field-field-room-number");
	let roomsNumbers = parseOutDataFromHyperlink(roomNumbersTD);

	// grab all the capacities from a building
	let capacitiesTD = parse_Out_Td_Based_Off_Attribute(data, "views-field views-field-field-room-capacity");
	let capacities = parseOutDataFromText(capacitiesTD);

	// grab all the Furniture type from a building
	let furnitureTypesTD = parse_Out_Td_Based_Off_Attribute(data, "views-field views-field-field-room-furniture");
	let furnitureTypes = parseOutDataFromText(furnitureTypesTD);

	// grab all the Room type from a building
	let roomTypesTD = parse_Out_Td_Based_Off_Attribute(data, "views-field views-field-field-room-type");
	let roomTypes = parseOutDataFromText(roomTypesTD);

	for(let i in roomsNumbers) {
		let roomJSON = {
			rooms_fullname:BuildingFullName,
			rooms_shortname:BuildingShortName,
			rooms_number:roomsNumbers[i],
			rooms_name:BuildingShortName + roomsNumbers[i],
			rooms_address:BuildingAdr,
			rooms_lat:"",
			rooms_lon:"",
			rooms_seats:capacities[i], // need to add default value
			rooms_type:roomTypes[i],
			rooms_furniture:furnitureTypes[i],
			rooms_href:"http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/"
				+ BuildingShortName + "-" + roomsNumbers[i],
		};
		roomJsons.push(roomJSON);
	}

	return roomJsons;
}

export{DFS, saveToDisk, parseCourses, parse_Out_Td_Based_Off_Attribute,
	parseOutDataFromText, parseOutDataFromHyperlink, parseRooms};
