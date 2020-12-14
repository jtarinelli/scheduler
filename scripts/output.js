// Functions to read in input, run the actual simulation, and generate output

/* Runs when submit/go button is clicked
 */
function submitButton() {
	let fifoOutput = document.getElementById("fifo-output");
	let rrOutput = document.getElementById("rr-output");
	
	// clears outputs
	fifoOutput.innerHTML = "";
	rrOutput.innerHTML = "";
	
	// read in inputs
	let quantum = Number(document.getElementById("quantum").value); 
	let jobs = readInJobs();

	// run FIFO simulation + stats
	let fifoBlocks = FIFO(jobs);
	generateStats(jobs, fifoOutput);
	generateSimulation(fifoBlocks, fifoOutput);

	// reset jobs in between
	jobs = readInJobs();
	
	// run RR simulation + stats
	let rrBlocks = roundRobin(jobs, quantum);
	generateStats(jobs, rrOutput);
	generateSimulation(rrBlocks, rrOutput);
}

/* Reads in input from the form and returns a list of job objects
 */
function readInJobs() {
	let jobsList = document.getElementById("jobs");
	let jobs = [];
	
	for(job of jobsList.children) {
		let name = job.children[0].innerText;
		let arrival = Number(job.children[2].value);
		let length = Number(job.children[4].value);
		let ioFreq = Number(job.children[6].value);
		let ioLength = Number(job.children[8].value);
		let color = job.getAttribute("color");
		jobs.push({
			name: name,
			color: color,
			arrival: arrival,
			length:	length,
			ioFreq: ioFreq,
			ioLength: ioLength,
			start: -1, 
			finish: -1,
			runtime: 0, // not used for FIFO
			completed: false // not used for FIFO
		});
	}

	return jobs;
}

/* Takes in a list of jobs and returns a list of blocks (as in blocks of runtime)
 * using the first in first out (FIFO) algorithm
 */
function FIFO(jobs) {
	let time = 0;
	let completedJobs = 0;
	let queueIndex = 0;
	let blocks = [];
	
	while (completedJobs < jobs.length) {
		// list of jobs that have arrived and aren't complete
		let queue = jobs.filter(job => !job.completed && job.arrival <= time).sort((a, b) => a.arrival - b.arrival);
		let thisBlock = null;
		
		if (queue.length == 0) {
			thisBlock = makeBlock("Empty", "transparent", time, 1);
		} else {			
			let job = queue[0];
			
			// handle i/o break
			// add a new job to the jobs array that arrives at time + job.ioLength
			if (job.ioFreq != 0 && job.start != -1 && (job.runtime % job.ioFreq) == 0) {
				let newJob = {};
				Object.assign(newJob, job); // copy job to newJob
				newJob.arrival = time + job.ioLength;
				newJob.start = -1;
				newJob.finish = -1;
				jobs.push(newJob);
				
				job.finish = time;
				job.completed = true;
				completedJobs += 1;
				continue; // skip back to top of loop
			}

			if (job.start == -1) {
				job.start = time;
			}
			
			job.runtime += 1;
			thisBlock = makeBlock(job.name, job.color, time, 1);
			
			if (job.runtime >= job.length) {
				job.finish = time + 1;
				job.completed = true;
				completedJobs += 1;
			}
		}
		
		// combine this block with the previous one if possible
		if (thisBlock != null && blocks.length > 0 && thisBlock.name == blocks[blocks.length-1].name) {
			blocks[blocks.length - 1].length += 1;
		} else if (thisBlock != null) {
			blocks.push(thisBlock);
		}
		time += 1;
	}
	
	return blocks; 
}

/* Takes in an array of jobs and the length of a timeslice 
 * and returns an array of blocks of runtime according to the round robin algorithm
 */
function roundRobin(jobs, quantum) {
	let time = 0;
	let completedJobs = 0;
	let queueIndex = 0;
	let blocks = [];
	
	while (completedJobs < jobs.length) {
		// list of jobs that have arrived and aren't complete
		let queue = jobs.filter(job => !job.completed && job.arrival <= time).sort((a, b) => a.arrival - b.arrival);
		let thisBlock = null;
		
		if (queue.length == 0) {
			thisBlock = makeBlock("Empty", "transparent", time, 1);
		} else {
			// if a timeslice has been completed, move onto next job in the queue
			if (time > 0 && time % quantum == 0) {
				queueIndex += 1;
			} 
			
			// make sure queueIndex is within the length of the current queue
			queueIndex = queueIndex % queue.length;
			let job = queue[queueIndex];
			
			// handle i/o break
			// add a new job to the jobs array that arrives at time + job.ioLength
			if (job.ioFreq != 0 && job.start != -1 && (job.runtime % job.ioFreq) == 0) {
				let newJob = {};
				Object.assign(newJob, job); // copy job to newJob
				newJob.arrival = time + job.ioLength;
				newJob.start = -1;
				newJob.finish = -1;
				jobs.push(newJob);
				
				job.finish = time;
				job.completed = true;
				completedJobs += 1;
				continue; // skip back to top of loop
			}

			if (job.start == -1) {
				job.start = time;
			}
			
			job.runtime += 1;
			thisBlock = makeBlock(job.name, job.color, time, 1);
			
			if (job.runtime >= job.length) {
				job.finish = time + 1;
				job.completed = true;
				completedJobs += 1;
			}
		}
		
		// combine this block with the previous one if possible
		if (thisBlock != null && blocks.length > 0 && thisBlock.name == blocks[blocks.length-1].name) {
			blocks[blocks.length - 1].length += 1;
		} else if (thisBlock != null) {
			blocks.push(thisBlock);
		}
		time += 1;
	}

	return blocks; 
}
 
/* Makes a block (of runtime) object
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

/* Goes through a list of jobs and sticks subjobs split up by I/O with the same name back together,
 * preserving the first subjob's arrival and start time, and the last subjob's finish time.
 * Runtime isn't preserved but it doesn't matter for the purpose of calculating turnaround/response times.
 */
function combineJobs(jobs) {
	if (jobs.length < 2) {
		return jobs;
	}

	// groups jobs with the same name together
	jobs.sort((a, b) => a.name - b.name);
	let newJobs = [jobs[0]];
	
	for (let i = 1; i < jobs.length; i++) {
		if (jobs[i - 1].name != jobs[i].name) {
			newJobs.push(jobs[i]);
		} else {
			let newJobsLast = newJobs[newJobs.length - 1];
			if (jobs[i].arrival < newJobsLast.arrival) {
				newJobsLast.arrival = jobs[i].arrival;
			}
			if (jobs[i].start < newJobsLast.start) {
				newJobsLast.start = jobs[i].start;
			}
			if (jobs[i].finish > newJobsLast.finish) {
				newJobsLast.finish = jobs[i].finish;
			}
		}
	}

	return newJobs;
}

/* Calculates the average response and turnaround time for a list of jobs
 * and adds them to the end of the output. 
 */
function generateStats(jobs, output) {
	 // clears the output
	let combinedJobs = combineJobs(jobs);
	
	let turnaroundTotal = 0;
	let responseTotal = 0;
	
	for (job of combinedJobs) {
		turnaroundTotal += (job.finish - job.arrival);
		responseTotal += (job.start - job.arrival);
	}
	
	let averageTurnaround = turnaroundTotal / combinedJobs.length;
	let averageResponse = responseTotal / combinedJobs.length;
	
	let averages = document.createElement("div");
	averages.innerHTML = "Average Turnaround Time: " + averageTurnaround + "</br>Average Response Time: " + averageResponse;
	averages.setAttribute("class", "stats");
	output.appendChild(averages);
}

/* Takes in a block object and returns a block node
 */ 
function makeBlockNode(blockObj) {
	let blockNode = document.createElement("div");
	blockNode.innerText = blockObj.name + "~  start: " + blockObj.start + "  end: " + (blockObj.start + blockObj.length) + "  length: " + blockObj.length;
	blockNode.setAttribute("style", "height: " + (blockObj.length * 20) + "px; background: " + blockObj.color +";");
	blockNode.setAttribute("class", "block");
	return blockNode;
}
