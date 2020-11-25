var numJobs = 1;
var jobs = {}; 

function changeTitle () {
	var title = document.getElementsByTagName("h1")[0];
	title.innerText = "Scheduler wow!";
}

function addJob() {
	numJobs++;
	var job1 = document.getElementById("job-1");
	var jobsList = document.getElementById("jobs");
	var newJob = job1.cloneNode(true);
	newJob.id = "job-" + numJobs;
	newJob.firstElementChild.innerText = "Job " + numJobs;
	jobsList.appendChild(newJob);
}

function submit() {
	console.log("submit button pressed");
	var start1 = document.getElementById("start-1").value;
	var length1 = document.getElementById("length-1").value;
	console.log("job 1: start: " + start1 + " length: " + length1);
}

function makeBlock() {
	// returns a div of a certain width + color
}

