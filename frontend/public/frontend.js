document.getElementById("searchCourses").addEventListener("click", handleSearchCourses);
document.getElementById("searchAVG").addEventListener("click", handleSearchAVG);
//document.getElementById("click-me-button1").addEventListener("click", handleClickMe1);
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
		.then(json => {
			//console.log(json)
			var resultG = JSON.stringify(json)
			var resultF = Object.values(json);
			//document.write(JSON.stringify(resultF));
			var resultD = JSON.stringify(resultF);
			console.log(resultD)
			document.write("<br>")
			//document.write(resultD);
			//var address = (JSON.stringify(json));
			//console.log(address);
			//document.write(address)
			document.write("<br>")
			console.log(Object.values(resultF));

			createTable();
			resultF.forEach(vayne => {
				for (let value in vayne) {
					finalL = `${JSON.stringify(Object.values(vayne[value]))}`
					document.write(finalL);
					document.write("<br>")
				}
			})
			function createTable() {
				var table = document.createElement("table")
				let row = "";
				table.style.border = '1px solid black';
				row += "<tr><th>Title</th><th>Year</th><th>ID</th<th>Department</th></tr>"
				table.innerHTML = row;
				document.body.append(table);
			}

		});


	document.write("Professor "+iname+" has taught: ")


	// var xhr = new XMLHttpRequest();
	// xhr.open("POST", "http://localhost:4321/query", true)
	// xhr.setRequestHeader('Content-Type', 'application/json')
	// xhr.send(JSON.stringify(
	// 	{
	// 		WHERE: {
	// 			IS: {
	// 				courses_instructor: iname
	// 			}
	// 		},
	// 		OPTIONS: {
	// 			COLUMNS: [
	// 				"courses_dept",
	// 				"courses_id",
	// 				"courses_title",
	// 				"courses_year"
	// 			],
	// 			ORDER: {
	// 				"dir": "DOWN",
	// 				"keys": ["courses_year"]
	// 			}
	// 		}
	// 	}
	// ))

	// get professors fullname
	// filter out with the professors full name
	// return a list show only the courses (courses dept, id and title in columns) that the prof has taught
	//sort by year
	//
	//process user input
	//send data and process to server
	// server: process request from ui
	//send back response
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
		.then(json => {
			//document.write(JSON.stringify(json))
			var resultF = Object.values(json);
			//document.write(JSON.stringify(resultF));
			var resultD = JSON.stringify(resultF);
			console.log(resultD)
			document.write("<br>")
			//document.write(resultD);
			//var address = (JSON.stringify(json));
			//console.log(address);
			//document.write(address)
			document.write("<br>")
			console.log(Object.values(resultF));

			createTable();
			resultF.forEach(vayne => {
				for (let value in vayne) {
					finalL = `${JSON.stringify(Object.values(vayne[value]))}`
					document.write(finalL);
					document.write("<br>")
				}
			}
			)
			function createTable() {
				var table = document.createElement("table")
				let row = "";
				table.style.border = '1px solid black';
				row += "<tr><th>Instructor</th><th>ID</th><th>Average</th<th>Department</th></tr>"
				table.innerHTML = row;
				document.body.append(table);
			}
			}
		)
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
