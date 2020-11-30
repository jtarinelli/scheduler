// functions to manage the input/form
var numJobs = 1;
var minJobs = 1;
var maxJobs = 10;

function addJob() {
	if (numJobs < maxJobs) {
		numJobs++;
		var job1 = document.getElementById("job-1");
		var jobsList = document.getElementById("jobs");
		var newJob = job1.cloneNode(true);
		changeJobNumber(newJob, numJobs);
		setJobValues(newJob, 0, 0);
		jobsList.appendChild(newJob);
	}
}

function removeJob(number) {
	if (numJobs > minJobs) {
		var jobsList = document.getElementById("jobs");
		jobsList.removeChild(jobsList.children[number-1]);
		for(i = number-1; i < jobsList.childElementCount; i++) {
			changeJobNumber(jobsList.children[i], i+1);
		}
		numJobs--;
	}
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

// sets the arrival time and length of a job
function setJobValues(job, arrival, length) {
	job.children[2].value = arrival;
	job.children[4].value = length;
}

// sets the arrival and length of every job to a random value
function randomize() {
	var jobsList = document.getElementById("jobs").children;
	arrivalMin = 0;
	arrivalMax = 10;
	lengthMin = 1;
	lengthMax = 10;
	
	for (job of jobsList) {
		var arrival = Math.floor(Math.random() * (arrivalMax - arrivalMin) ) + arrivalMin;
		var length = Math.floor(Math.random() * (lengthMax - lengthMin) ) + lengthMin;
		setJobValues(job, arrival, length);
	}
}
