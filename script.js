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
	newJob.children[0].innerText = "Job " + numJobs;
	newJob.children[2].id = "start-" + numJobs;
	newJob.children[2].value = 0;
	newJob.children[1].setAttribute("for","start-" + numJobs);
	newJob.children[4].id = "length-" + numJobs;
	newJob.children[4].value = 0;
	newJob.children[1].setAttribute("for","length-" + numJobs);
	jobsList.appendChild(newJob);
}

function submitButton() {
	console.log("submit button pressed");
	var jobsList = document.getElementById("jobs");
	jobs = [];
	
	for(job of jobsList.children) {
		var name = job.children[0].innerText;
		var start = job.children[2].value;
		var length = job.children[4].value;
		jobs.push({
			name: name,
			start: start,
			length, length
		});
	}
	console.log(jobs);
}

function makeBlock() {
	// returns a div of a certain width + color
}

// write a function that takes in an array of job objects
// and returns the time periods each job ran for

