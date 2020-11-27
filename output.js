// functions to manage the actual simulation and generating output

// runs when submit/go button is clicked
function submitButton() {
	console.log("submit button pressed");
	jobs = readInJobs();
	console.log(jobs);
	FIFO(jobs);
}

// reads in input from the form and returns a list of job objects
// maybe want to take out a function that takes in job node and returns job object
function readInJobs() {
	var jobsList = document.getElementById("jobs");
	var jobs = [];
	
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
	var output = document.getElementById("output");
	output.innerHTML = ""; // controversial way to clear all children
	
	jobs.sort(job => job.start); // check about compatability of arrow functions
	var time = 0;
	var blocks = []; // idk what else to call this
	
	for (job of jobs) {
		console.log(job.name + " runs at time " + time);
		blocks.push({
			name: job.name,
			start: time,
			length: job.length
		});
		time += job.length;
	}
	console.log("All jobs complete at time " + time);
	
	for (block of blocks) {
		var newBlock = document.createElement("div");
		newBlock.innerText = block.name;
		newBlock.setAttribute("style", "border: 1px solid black; height: " + (block.length * 16) + "px;");
		output.appendChild(newBlock);
	}
}

function roundRobin(jobs, quantum) {
	jobs.sort(job => job.start);
	var i = 0;
	
}
