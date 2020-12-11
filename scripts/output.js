// functions to read in input, run the actual simulation, and generate output
// maybe should seperate out all document.getWhatever from normal functions

// runs when submit/go button is clicked
function submitButton() {
	let fifoOutput = document.getElementById("fifo-output");
	let rrOutput = document.getElementById("rr-output");
	let quantum = Number(document.getElementById("quantum").value); 
	let jobs = readInJobs();
	//jobs = breakUpIO(jobs);
	/*
	let fifoBlocks = FIFO(jobs);
	generateStats(jobs, fifoOutput);
	generateSimulation(fifoBlocks, fifoOutput);
	*/
	// reset jobs in between
	jobs = readInJobs();
	//jobs = breakUpIO(jobs);
	
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
	console.log(jobs);
	return jobs;
}

/* takes in jobs and breaks them into smaller subjobs when they're not waiting for i/o
*/
function breakUpIO(jobs) {
	let newJobs = [];
	for (job of jobs) {
		if (job.ioFreq == 0 || job.ioLength == 0 || job.ioFreq >= job.length) {
			newJobs.push(job);
		} else {
			let runtime = 0;
			let time = job.arrival;
			for (let i = 0; i < Math.floor(job.length / job.ioFreq); i++) {
				let subJob = {};
				Object.assign(subJob, job); // copies values of job to subJob (check compatability) 
				subJob.arrival = time;
				subJob.length = job.ioFreq;
				newJobs.push(subJob);
				runtime += job.ioFreq;
				time += job.ioFreq + job.ioLength;
			}

			if (runtime != job.length) {
				let subJob = {};
				Object.assign(subJob, job);
				subJob.arrival = time;
				subJob.length = job.length - runtime;
				newJobs.push(subJob);
			}
		}
	}
	return newJobs
}

/* reads in a list of jobs and returns a list of blocks (as in blocks of time when each job runs)
 * using the first in first out (FIFO) algorithm
 */
function FIFO(jobs) {	
	jobs = jobs.filter(job => job.length != 0);
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
	jobs = jobs.filter(job => job.length != 0);
	console.log(jobs); // for whatever reason jobs has WAY more jobs than there should be and idk why cause i'm not calling breakupIO?
	let time = 0;
	let completedJobs = 0;
	let queueIndex = 0;
	let blocks = [];
	
	//for (let i=0; i<10; i++) {
	while (completedJobs < jobs.length) {
		let queue = jobs.filter(job => !job.completed && job.arrival <= time).sort((a, b) => a.arrival - b.arrival);
		let thisBlock = null;
		console.log("queue", queue);
		console.log(time, jobs);
		
		if (queue.length == 0) {
			thisBlock = makeBlock("Empty", "transparent", time, 1);
		} else {
			if (time > 0 && time % quantum == 0) {
				queueIndex += 1;
			} 
			
			queueIndex = queueIndex % queue.length;
			let job = queue[queueIndex];
			
			// handle i/o break
			// add a new job to the jobs array that arrives at time + job.ioLength

			if (job.ioFreq != 0 && job.runtime != 0 && (job.runtime % job.ioFreq) == 0) {
				console.log(job, job.runtime, job.ioFreq, job.runtime % job.ioFreq);

				let newJob = {};
				Object.assign(newJob, job);
				newJob.arrival = time + job.ioLength;
				newJob.runtime += 1;
				newJob.start = -1;
				newJob.finish = -1;
				jobs.push(newJob);
				
				job.finish = time;
				job.completed = true;
				completedJobs += 1;
				queueIndex += 1;
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

/* goes through a job list that's been broken up by I/O and sticks jobs with the same name back together
 * preserving the first subjob's arrival and start time, and the last subjob's finish time
 * runtime isn't preserved but it doesn't matter for the purpose of calculating turnaround/response times
 */
function combineJobs(jobs) {
	if (jobs.length < 2) {
		return jobs;
	}
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
	console.log(newJobs);
	return newJobs;
}

// calculates the average response and turnaround time and adds them to the end of the output
function generateStats(jobs, output) {
	output.innerHTML = ""; // controversial way to clear all children
	let combinedjobs = combineJobs(jobs);
	
	let turnaroundTotal = 0;
	let responseTotal = 0;
	
	for (job of combinedjobs) {
		turnaroundTotal += (job.finish - job.arrival);
		responseTotal += (job.start - job.arrival);
	}
	
	let averageTurnaround = turnaroundTotal / combinedjobs.length;
	let averageResponse = responseTotal / combinedjobs.length;
	
	let averages = document.createElement("div");
	averages.innerHTML = "Average Turnaround Time: " + averageTurnaround + "</br>Average Response Time: " + averageResponse;
	averages.setAttribute("class", "stats");
	output.appendChild(averages);
}

// takes in a block object and returns a block node
function makeBlockNode(blockObj) {
	let blockNode = document.createElement("div");
	blockNode.innerText = blockObj.name + "~  start: " + blockObj.start + "  end: " + (blockObj.start + blockObj.length) + "  length: " + blockObj.length;
	blockNode.setAttribute("style", "height: " + (blockObj.length * 20) + "px; background: " + blockObj.color +";");
	blockNode.setAttribute("class", "block");
	return blockNode;
}
