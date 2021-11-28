document.getElementById("searchCourses").addEventListener("click", handleSearchCourses);
document.getElementById("searchAVG").addEventListener("click", handleSearchAVG);
document.getElementById("prof_fullname").addEventListener("focus", handleTyping);
document.getElementById("name1").addEventListener("focus", handleTyping1);
document.getElementById("name2").addEventListener("focus", handleTyping2);

function handleSearchCourses() {
	var iname = document.getElementById("prof_fullname").value;
	alert("Searching for courses taught by professor: "+iname)
	const address = fetch("http://localhost:4321/query", {
		method: "POST",
		headers: {'Content-Type': 'application/json'},
		body:JSON.stringify({
			WHERE: {
				"AND" : [{
					"IS": {
						"courses_instructor": iname
					}
				},
					{
						"GT": {
							"courses_avg": 95
						}
					}]
			},
			OPTIONS: {
				COLUMNS: [
					"courses_dept",
					"courses_id",
					"courses_title",
					"courses_year"
				],
				ORDER: {
					"dir": "DOWN",
					"keys": ["courses_year"]
				}
			}
		})
	})
		.then(response => response.json())
		.then(jsonResult => {
			//body reference
			var body = document.getElementsByTagName("body")[0];

			// create elements <table> and a <tbody>
			var tbl = document.createElement("table");
			var tblBody = document.createElement("tbody");
			var thead = document.createElement('thead');
			const resultG = JSON.stringify(jsonResult.result);
			const cols = ["courses_title", "courses_year", "courses_id", "courses_dept"];
			const headers = ["Title", "Year", "ID", "Deptartment"];
			tbl.appendChild(thead);

			for(let i = 0; i < headers.length;i++){
				thead.appendChild(document.createElement("th")).
				appendChild(document.createTextNode(headers[i]));
			}

			// cells creation
			for (let j = 0; j < JSON.parse(resultG).length; j++) {
				// table row creation
				const row = document.createElement("tr");

				for (let i = 0; i < cols.length; i++) {
					// create element <td> and text node
					//Make text node the contents of <td> element
					// put <td> at end of the table row
					let val = JSON.parse(resultG)[j][cols[i]];
					const cell = document.createElement("td");
					const cellText = document.createTextNode(val);

					cell.appendChild(cellText);
					row.appendChild(cell);
				}

				//row added to end of table body
				tblBody.appendChild(row);
			}

			// append the <tbody> inside the <table>
			tbl.appendChild(tblBody);
			// put <table> in the <body>
			body.appendChild(tbl);
			// tbl border attribute to
			tbl.setAttribute("border", "2");
		});

	document.write("Professor "+iname+" has taught: ")
}
function handleSearchAVG() {
	// get courses' dept name and ID
	// search for all courses with the specific dept name and ID, put them in a list
	// return list showing the each course, professor name and the average. (sorted maybe?)

	var dname = document.getElementById("name1").value;
	var cid = document.getElementById("name2").value;
	alert("Searching for courses with department: "+dname+" and course id: "+cid)

	fetch("http://localhost:4321/query", {
		method: "POST",
		headers: {'Content-Type': 'application/json'},
		body:JSON.stringify({
			"WHERE": {
				"AND" : [{
					"IS": {
						"courses_dept": dname
					}
				},
					{
						"IS": {
							"courses_id": cid
						}
					}]
			},
			"OPTIONS": {
				"COLUMNS": [
					"courses_dept",
					"courses_id",
					"courses_instructor",
					"courses_avg"
				],
				"ORDER": {
					"dir": "DOWN",
					"keys": [
						"courses_avg"
					]
				}
			}
		})
	}).then(response => response.json())
		.then(jsonResult => {
			//body reference
			var body = document.getElementsByTagName("body")[0];

			// create elements <table> and a <tbody>
			var tbl = document.createElement("table");
			var tblBody = document.createElement("tbody");
			var thead = document.createElement('thead');
			const resultG = JSON.stringify(jsonResult.result);
			const cols = ["courses_instructor", "courses_id", "courses_avg", "courses_dept"];
			const headers = ["Instructor", "ID", "AVG", "Deptartment"];
			tbl.appendChild(thead);

			for(let i = 0; i < headers.length;i++){
				thead.appendChild(document.createElement("th")).
				appendChild(document.createTextNode(headers[i]));
			}

			// cells creation
			for (let j = 0; j < JSON.parse(resultG).length; j++) {
				// table row creation
				const row = document.createElement("tr");

				for (let i = 0; i < cols.length; i++) {
					// create element <td> and text node
					//Make text node the contents of <td> element
					// put <td> at end of the table row
					let val = JSON.parse(resultG)[j][cols[i]];
					const cell = document.createElement("td");
					const cellText = document.createTextNode(val);

					cell.appendChild(cellText);
					row.appendChild(cell);
				}

				//row added to end of table body
				tblBody.appendChild(row);
			}

			// append the <tbody> inside the <table>
			tbl.appendChild(tblBody);
			// put <table> in the <body>
			body.appendChild(tbl);
			// tbl border attribute to
			tbl.setAttribute("border", "2");
		})
	document.write("Complete, user story 2 result =")
}

function createTable(data) {
	var tableColumn = [];
}


function handleTyping() {
	console.log("Typing in prof_fullname");
}

function handleTyping1() {
	console.log("Typing in courses_dept");
}

function handleTyping2() {
	console.log("Typing in courses_id");
}
