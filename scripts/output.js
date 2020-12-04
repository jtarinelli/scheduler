// functions to read in input, run the actual simulation, and generate output
// maybe should seperate out all document.getWhatever from normal functions

// runs when submit/go button is clicked
function submitButton() {
	let jobs = readInJobs();
	let quantum = Number(document.getElementById("quantum").value); // don't leave this in here
	let blocks = roundRobin(jobs, quantum);
	//let blocks = FIFO(jobs);
	generateSimulation(blocks);
	generateStats(jobs);
}

function fifoButton() {
	let jobs = readInJobs();
	let blocks = FIFO(jobs);
	generateSimulation(blocks);
	generateStats(jobs);
}

function rrButton() {
	let jobs = readInJobs();
	let quantum = Number(document.getElementById("quantum").value); // don't leave this in here
	let blocks = roundRobin(jobs, quantum);
	generateSimulation(blocks);
	generateStats(jobs);
}

// reads in input from the form and returns a list of job objects
// maybe want to take out a function that takes in job node and returns job object
function readInJobs() {
	let jobsList = document.getElementById("jobs");
	let jobs = [];
	
	for(job of jobsList.children) {
		let name = job.children[0].innerText;
		let arrival = Number(job.children[2].value);
		let length = Number(job.children[4].value);
		let color = job.getAttribute("color");
		jobs.push({
			name: name,
			color: color,
			arrival: arrival,
			length, length,
			start: -1, 
			finish: -1,
			runtime: 0, // not used for FIFO
			completed: false // not used for FIFO
		});
	}
	return jobs;
}

// reads in a list of jobs and returns a list of blocks (as in blocks of time when each job runs)
// using the first in first out (FIFO) algorithm
function FIFO(jobs) {	
	jobs.sort((a, b) => a.arrival - b.arrival); // check about compatability of arrow functions
	let time = 0;
	let blocks = []; 
	
	for (job of jobs) {
		// check for gaps between jobs, or between time 0 and the first job
		if ((blocks.length == 0 && job.arrival != 0) || (blocks.length > 0 && (blocks[blocks.length-1].start + blocks[blocks.length-1].length) < job.arrival)) {
			blocks.push({
				name: "Empty",
				color: "transparent",
				start: time,
				length: job.arrival - time
			});
			time = job.arrival;
		}

		// run the whole job
		job.start = time;
		blocks.push({
			name: job.name,
			color: job.color,
			start: time,
			length: job.length
		});
		time += job.length;
		job.finish = time;
	}
	
	return blocks;
}

// question: if a job finishes before the time slice is up,
// does the scheduler go straight to the next job or is the CPU empty
// until the end of that timeslice? 
// right now it jumps right to the next job
// similarly, if a job arrives in the middle of an empty timeslice, does
// it start right away or wait for the next timeslice to start? 
// right now it starts right away
function roundRobin(jobs, quantum) {
	jobs.sort((a, b) => a.arrival - b.arrival); 
	let time = 0;
	let completedJobs = 0;
	let blocks = [];
	
	while (completedJobs < jobs.length) {
		
		// check for gaps between jobs? not 100% sure if this is correct yet
		// also is probably unnecessarily complicated
		if (jobs.filter(job => !job.completed).every(job => job.arrival > time)) {
			let sortedIncompleteJobs = jobs.filter(job => !job.completed).sort((a, b) => a.arrival - b.arrival);
			let nextJob = sortedIncompleteJobs[0];
			
			blocks.push({
				name: "Empty",
				color: "transparent",
				start: time,
				length: nextJob.arrival - time
			});
			time = nextJob.arrival;
		}
		
		for (job of jobs.filter(job => !job.completed)) {
			
			if (job.arrival <= time) {
				if (job.runtime == 0) {
					job.start = time;
				}
				
				let thisBlock = {
					name: job.name,
					color: job.color,
					start: time,
					length: quantum
				}

				if (job.runtime + quantum >= job.length) {
					time += job.length - job.runtime;
					thisBlock.length = job.length - job.runtime;
					job.runtime = job.length;
					job.finish = time;
					job.completed = true;
					completedJobs += 1;
				} else {
					time += quantum;
					job.runtime += quantum;
				}
				
				if (blocks.length > 0 && blocks[blocks.length - 1].name == thisBlock.name) {
					blocks[blocks.length - 1].length += thisBlock.length;
				} else {
					blocks.push(thisBlock);
				}
			} 
		}
	}

	return blocks;
}

// takes an array of blocks and makes it into nodes and puts them on the page (terrible description)
function generateSimulation(blocks) {
	let output = document.getElementById("output");
	output.innerHTML = ""; // controversial way to clear all children
	
	for (block of blocks) {
		let newBlock = makeBlockNode(block);
		output.appendChild(newBlock);
	}
}

// calculates the average response and turnaround time and adds them to the end of the output
function generateStats(jobs) {
	let output = document.getElementById("output");
	let turnaroundTotal = 0;
	let responseTotal = 0;
	
	for (job of jobs) {
		turnaroundTotal += (job.finish - job.arrival);
		responseTotal += (job.start - job.arrival);
	}
	
	let averageTurnaround = turnaroundTotal / jobs.length;
	let averageResponse = responseTotal / jobs.length;
	
	let averages = document.createElement("div");
	averages.innerHTML = "Average Turnaround Time: " + averageTurnaround + "</br>Average Response Time: " + averageResponse;
	output.appendChild(averages);
}

// takes in a block object and returns a block node
function makeBlockNode(blockObj) {
	let blockNode = document.createElement("div");
	blockNode.innerText = blockObj.name + "~  start: " + blockObj.start + "  end: " + (blockObj.start + blockObj.length);
	blockNode.setAttribute("style", "height: " + (blockObj.length * 16) + "px; background: " + blockObj.color +";");
	return blockNode;
}
