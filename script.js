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
	changeJobNumber(newJob, numJobs);
	resetJob(newJob);
	jobsList.appendChild(newJob);
}

function removeJob(number) {
	var jobsList = document.getElementById("jobs");
	jobsList.removeChild(jobsList.children[number-1]);
	for(i = number-1; i < jobsList.childElementCount; i++) {
		changeJobNumber(jobsList.children[i], i+1);
	}
	numJobs--;
}

// updates an existing job to change all references to its number
function changeJobNumber(job, number) {
	job.id = "job-" + number;
	job.children[0].innerText = "Job " + number;
	job.children[2].id = "start-" + number;
	job.children[1].setAttribute("for","start-" + number);
	job.children[4].id = "length-" + number;
	job.children[3].setAttribute("for","length-" + number);
	job.children[5].setAttribute("onclick","removeJob(" + number + ")");
}

// changes all the inputs for a job to 0
function resetJob(job) {
	job.children[2].value = 0;
	job.children[4].value = 0;
}

// runs when submit/go button is clicked
function submitButton() {
	console.log("submit button pressed");
	jobs = readInJobs();
	console.log(jobs);
	FIFO(jobs);
}

// reads in inputs from the form and returns a list of job objects
function readInJobs() {
	var jobsList = document.getElementById("jobs");
	var jobs = []
	
	for(job of jobsList.children) {
		var name = job.children[0].innerText;
		var start = Number(job.children[2].value);
		var length = Number(job.children[4].value);
		jobs.push({
			name: name,
			start: start,
			length, length
		});
	}
	return jobs;
}

function FIFO(jobs) {
	jobs.sort(job => job.start); // check about compatability of arrow functions
	var time = 0;
	for (job of jobs) {
		console.log(job.name + " runs at time " + time);
		time += job.length;
	}
	console.log("All jobs complete at time " + time);
}

function roundRobin(jobs) {
	
}

function makeBlock() {
	// returns a div of a certain width + color
}

// write a function that takes in an array of job objects
// and returns the time periods each job ran for

