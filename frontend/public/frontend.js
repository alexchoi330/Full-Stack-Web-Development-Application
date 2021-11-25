document.getElementById("search").addEventListener("submit", handleSearch);
document.getElementById("click-me-button1").addEventListener("click", handleClickMe);
document.getElementById("click-me-button2").addEventListener("click", handleClickMe);
document.getElementById("prof_fullname").addEventListener("focus", handleTyping);

function handleClickMe() {
	alert("Button Clicked!");
}

function handleTyping() {
	console.log("Typing in prof_fullname");
}

function handleSearch() {
	alert("results are in the next page")
	// get professors fullname that's inputted by the user in a variable
	// filter out all the courses with the fullname,
	// and show only the courses (courses dept, id and title in columns) that the prof is teaching

}
