document.getElementById("searchCourses").addEventListener("submit", handleSearchCourses);
document.getElementById("searchAVG").addEventListener("submit", handleSearchAVG);
//document.getElementById("click-me-button1").addEventListener("click", handleClickMe1);
//document.getElementById("click-me-button2").addEventListener("click", handleClickMe);
document.getElementById("prof_fullname").addEventListener("focus", handleTyping);
document.getElementById("name1").addEventListener("focus", handleTyping1);
document.getElementById("name2").addEventListener("focus", handleTyping2);


function handleClickMe1() {
	alert("Button Clicked!");
}

function handleClickMe() {
	alert("Button Clicked!");
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

function handleSearchCourses() {
	alert("results are in the next page")
	get(
		"index.html",
		{paramOne : 1, paramX : 'abc'},
		function(data) {
			alert('page content: ' + data)
		}
	);
	// get professors fullname
	// filter out with the professors full name
	// return a list show only the courses (courses dept, id and title in columns) that the prof has taught

}
function handleSearchAVG() {
	alert("results are in the next page")
	// get courses' dept name and ID
	// search for all courses with the specific dept name and ID, put them in a list
	// return list showing the each course, professor name and the average. (sorted maybe?)

}
