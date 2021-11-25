document.getElementById("search").addEventListener("click", handleSearch);
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
	alert("results..")
}
