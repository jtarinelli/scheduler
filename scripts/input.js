// functions to manage the input/form
let numJobs = 1;
let minJobs = 1;
let maxJobs = 10;

// background colors in order of which job they correspond to
let colors = ["#FF9AA2", "#FFB7B2", "#FFDAC1", "#fffecf", "#E2F0CB", "#B5EAD7", "#c5fcfb", "#d5cfff", "#fad2f7", "#eeeeee"];

function addJob() {
	if (numJobs < maxJobs) {
		numJobs++;
		let job1 = document.getElementById("job-1");
		let jobsList = document.getElementById("jobs");
		let newJob = job1.cloneNode(true);
		changeJobNumber(newJob, numJobs);
		setJobValues(newJob, 0, 1, 0, 0);
		jobsList.appendChild(newJob);
	}
}

function removeJob(number) {
	if (numJobs > minJobs) {
		let jobsList = document.getElementById("jobs");
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
	job.style = "background: " + colors[number - 1] + ";";
	job.setAttribute("color", colors[number - 1]);
	job.children[0].innerText = "Job " + number;
	job.children[2].id = "start-" + number;
	job.children[1].setAttribute("for","start-" + number);
	job.children[4].id = "length-" + number;
	job.children[3].setAttribute("for","length-" + number);
	job.children[6].id = "ioFreq-" + number;
	job.children[5].setAttribute("for","ioFreq-" + number);
	job.children[8].id = "ioLength-" + number;
	job.children[7].setAttribute("for","ioLength-" + number);
	job.children[9].setAttribute("onclick","removeJob(" + number + ")");
}

// change the values of a job's fields
function setJobValues(job, arrival, length, ioFreq, ioLength) {
	job.children[2].value = arrival;
	job.children[4].value = length;
	job.children[6].value = ioFreq;
	job.children[8].value = ioLength;
}

// sets the values every job to a random value
function randomize() {
	let jobsList = document.getElementById("jobs").children;
	arrivalMin = 0;
	arrivalMax = 10;
	lengthMin = 1;
	lengthMax = 10;
	ioFreqMin = 0;
	ioFreqMax = 10;
	ioLengthMin = 0;
	ioLengthMax = 10;
	
	for (job of jobsList) {
		let arrival = randomInt(arrivalMin, arrivalMax);
		let length = randomInt(lengthMin, lengthMax);
		let ioFreq = randomInt(ioFreqMin, ioFreqMax);
		let ioLength = randomInt(ioLengthMin, ioLengthMax);
		setJobValues(job, arrival, length, ioFreq, ioLength);
	}
}

// return a random integer between min and max
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min) ) + min;
}
