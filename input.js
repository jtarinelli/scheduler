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
		resetJob(newJob);
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

// changes all the inputs for a job to 0
function resetJob(job) {
	job.children[2].value = 0;
	job.children[4].value = 0;
}
