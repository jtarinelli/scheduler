// functions to read in input, run the actual simulation, and generate output
// maybe should seperate out all document.getWhatever from normal functions

let ioLength = 1;
/* to handle i/o, literally break jobs up into multiple jobs
with the same name when they're not waiting for io???
only problem is that it screws up generating stats 
so maybe go back and stick jobs with the same name back together at the end
*/

// runs when submit/go button is clicked
function submitButton() {
	let fifoOutput = document.getElementById("fifo-output");
	let rrOutput = document.getElementById("rr-output");
	let quantum = Number(document.getElementById("quantum").value); 
	let jobs = readInJobs();
	
	let fifoBlocks = FIFO(jobs);
	generateStats(jobs, fifoOutput);
	generateSimulation(fifoBlocks, fifoOutput);
	
	let rrBlocks = roundRobin(jobs, quantum);
	generateStats(jobs, rrOutput);
	generateSimulation(rrBlocks, rrOutput);
}

/* reads in input from the form and returns a list of job objects
 * maybe want to take out a function that takes in job node and returns job object
 */
function readInJobs() {
	let jobsList = document.getElementById("jobs");
	let jobs = [];
	
	for(job of jobsList.children) {
		let name = job.children[0].innerText;
		let arrival = Number(job.children[2].value);
		let length = Number(job.children[4].value);
		let ioFreq = Number(job.children[4].value);
		let color = job.getAttribute("color");
		jobs.push({
			name: name,
			color: color,
			arrival: arrival,
			length, length,
			ioFreq: ioFreq,
			start: -1, 
			finish: -1,
			runtime: 0, // not used for FIFO
			completed: false // not used for FIFO
		});
	}
	return jobs;
}

/* reads in a list of jobs and returns a list of blocks (as in blocks of time when each job runs)
 * using the first in first out (FIFO) algorithm
 */
function FIFO(jobs) {	
	jobs.sort((a, b) => a.arrival - b.arrival); // check about compatability of arrow functions
	let time = 0;
	let blocks = []; 
	
	for (job of jobs) {
		// check for gaps between jobs, or between time 0 and the first job
		if ((blocks.length == 0 && job.arrival != 0) || (blocks.length > 0 && (blocks[blocks.length-1].start + blocks[blocks.length-1].length) < job.arrival)) {
			blocks.push(makeBlock("Empty", "transparent", time, job.arrival - time));
			time = job.arrival;
		}

		// run the whole job
		job.start = time;
		blocks.push(makeBlock(job.name, job.color, time, job.length));
		time += job.length;
		job.finish = time;
	}
	
	return blocks;
}

// i think this works except sometimes rr doesn't update and fifo does when you 
// change something and hit go
// maybe its just cause it takes too long idk
function roundRobin(jobs, quantum) {
	let time = 0;
	let completedJobs = 0;
	let jobIndex = 0;
	let blocks = [];

	while (completedJobs < jobs.length && time < 20) {
		let queue = jobs.filter(job => !job.completed && job.arrival <= time).sort((a, b) => a.arrival - b.arrival);
		let thisBlock = null;
		
		if (queue.length == 0) {
			thisBlock = makeBlock("Empty", "transparent", time, 1);
		} else {
			if (time % quantum == 0) {
				jobIndex = (jobIndex + 1) % queue.length;
			}
			
			let job = queue[jobIndex];
			
			if (job.runtime == 0) {
				job.start = time;
			}
			
			job.runtime += 1;
			thisBlock = makeBlock(job.name, job.color, time, 1);
			
			if (job.runtime == job.length) {
				job.finish = time + 1;
				job.completed = true;
				completedJobs += 1;
			}
		}
		
		// combine this block with the previous one if possible
		if (thisBlock != null && blocks.length > 0 && thisBlock.name == blocks[blocks.length-1].name) {
			blocks[blocks.length - 1].length += 1;
		} else {
			blocks.push(thisBlock);
		}
		
		time += 1;
	}
	
	return blocks; 
 }
 
 /*
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
			
			blocks.push(makeBlock("Empty", "transparent", time, nextJob.arrival - time));
			time = nextJob.arrival;
		}
		
		for (job of jobs.filter(job => !job.completed)) {
			
			if (job.arrival <= time) {
				if (job.runtime == 0) {
					job.start = time;
				}
				
				let thisBlock = makeBlock(job.name, job.color, time, quantum);

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
*/

function makeBlock(name, color, start, length) {
	return {
		name: name,
		color: color,
		start: start,
		length: length
	}
}

// takes an array of blocks and makes it into nodes and puts them on the page (terrible description)
function generateSimulation(blocks, output) {
	let blocksDiv = document.createElement("div");
	blocksDiv.setAttribute("class", "blocks");
	for (block of blocks) {
		let newBlock = makeBlockNode(block);
		blocksDiv.appendChild(newBlock);
	}
	output.appendChild(blocksDiv);
}

// calculates the average response and turnaround time and adds them to the end of the output
function generateStats(jobs, output) {
	output.innerHTML = ""; // controversial way to clear all children
	
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
	averages.setAttribute("class", "stats");
	output.appendChild(averages);
	output.i
}

// takes in a block object and returns a block node
function makeBlockNode(blockObj) {
	let blockNode = document.createElement("div");
	blockNode.innerText = blockObj.name + "~  start: " + blockObj.start + "  end: " + (blockObj.start + blockObj.length) + "  length: " + blockObj.length;
	blockNode.setAttribute("style", "height: " + (blockObj.length * 17) + "px; background: " + blockObj.color +";");
	blockNode.setAttribute("class", "block");
	return blockNode;
}
