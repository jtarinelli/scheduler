// functions to read in input, run the actual simulation, and generate output

// runs when submit/go button is clicked
function submitButton() {
	var jobs = readInJobs();
	var blocks = FIFO(jobs);
	generateSimulation(blocks);
	generateStats(jobs);
}

// reads in input from the form and returns a list of job objects
// maybe want to take out a function that takes in job node and returns job object
function readInJobs() {
	var jobsList = document.getElementById("jobs");
	var jobs = [];
	
	for(job of jobsList.children) {
		var name = job.children[0].innerText;
		var arrival = Number(job.children[2].value);
		var length = Number(job.children[4].value);
		jobs.push({
			name: name,
			arrival: arrival,
			length, length,
			start: -1, 
			finish: -1
		});
	}
	return jobs;
}

// reads in a list of jobs and returns a list of blocks (as in blocks of time when each job runs)
// using the first in first out (FIFO) algorithm
function FIFO(jobs) {	
	jobs.sort((a, b) => a.arrival - b.arrival); // check about compatability of arrow functions
	var time = 0;
	var blocks = []; 
	
	for (job of jobs) {
		// check for gaps between jobs, or between time 0 and the first job
		if ((blocks.length == 0 && job.arrival != 0) || (blocks.length > 0 && (blocks[blocks.length-1].start + blocks[blocks.length-1].length) < job.arrival)) {
			blocks.push({
				name: "Empty",
				start: time,
				length: job.arrival - time
			});
			time = job.arrival;
		}

		// run the whole job
		job.start = time;
		blocks.push({
			name: job.name,
			start: time,
			length: job.length
		});
		time += job.length;
		job.finish = time;
	}
	
	return blocks;
}

// takes an array of blocks and makes it into nodes and puts them on the page (terrible description)
function generateSimulation(blocks) {
	var output = document.getElementById("output");
	output.innerHTML = ""; // controversial way to clear all children
	
	for (block of blocks) {
		var newBlock = makeBlockNode(block);
		output.appendChild(newBlock);
	}
}

// calculates the average response and turnaround time and adds them to the end of the output
function generateStats(jobs) {
	var output = document.getElementById("output");
	var turnaroundTotal = 0;
	var responseTotal = 0;
	
	for (job of jobs) {
		turnaroundTotal += (job.finish - job.arrival);
		responseTotal += (job.start - job.arrival);
	}
	
	var averageTurnaround = turnaroundTotal / jobs.length;
	var averageResponse = responseTotal / jobs.length;
	
	var averages = document.createElement("div");
	averages.innerHTML = "Average Turnaround Time: " + averageTurnaround + "</br>Average Response Time: " + averageResponse;
	output.appendChild(averages);
}

// takes in a block object and returns a block node
function makeBlockNode(blockObj) {
	var blockNode = document.createElement("div");
	blockNode.innerText = blockObj.name + "~  start: " + blockObj.start + "  end: " + (blockObj.start + blockObj.length);
	blockNode.setAttribute("style", "border: 1px solid black; height: " + (blockObj.length * 16) + "px;");
	return blockNode;
}

function roundRobin(jobs, quantum) {
	jobs.sort((a, b) => a.arrival - b.arrival); 
	var i = 0;
	
}
