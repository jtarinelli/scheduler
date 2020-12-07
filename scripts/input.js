// functions to manage the input/form
let numJobs = 1;
let minJobs = 1;
let maxJobs = 10;

// should probably just do this with css classes now that i think about it
//let colors = ["blue", "red", "yellow", "pink", "purple", "green", "magenta", "teal", "violet", "gray"];
let colors = ["#FF9AA2", "#FFB7B2", "#FFDAC1", "#fffecf", "#E2F0CB", "#B5EAD7", "#c5fcfb", "#d5cfff", "#fad2f7", "#eeeeee"];

function addJob() {
	if (numJobs < maxJobs) {
		numJobs++;
		let job1 = document.getElementById("job-1");
		let jobsList = document.getElementById("jobs");
		let newJob = job1.cloneNode(true);
		changeJobNumber(newJob, numJobs);
		setJobValues(newJob, 0, 1, 0);
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
	job.children[5].setAttribute("onclick","removeJob(" + number + ")");
}

// sets the arrival time and length of a job
function setJobValues(job, arrival, length, ioFreq) {
	job.children[2].value = arrival;
	job.children[4].value = length;
	job.children[6].value = ioFreq;
}

// sets the arrival and length of every job to a random value
function randomize() {
	let jobsList = document.getElementById("jobs").children;
	arrivalMin = 0;
	arrivalMax = 10;
	lengthMin = 1;
	lengthMax = 10;
	ioFreqMin = 0;
	ioFreqMax = 10;
	
	for (job of jobsList) {
		let arrival = Math.floor(Math.random() * (arrivalMax - arrivalMin) ) + arrivalMin;
		let length = Math.floor(Math.random() * (lengthMax - lengthMin) ) + lengthMin;
		let ioFreq = Math.floor(Math.random() * (ioFreqMax - ioFreqMin) ) + ioFreqMin;
		setJobValues(job, arrival, length, ioFreq);
	}
}
