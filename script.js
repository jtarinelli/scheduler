function changeTitle () {
	var title = document.getElementsByTagName("h1")[0];
	title.innerText = "wow! so cool!";
}

function submitButton() {
	console.log("submit button pressed");
	var start1 = document.getElementById("start-1").value;
	var length1 = document.getElementById("length-1").value;
	console.log("job 1: start: " + start1 + " length: " + length1);
}

