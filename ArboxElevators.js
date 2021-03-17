
// Class to define an elevator.
class MovingElevator {
    constructor(elevatorId){
        this.moving = false;
        this.floor = 0;
        this.carId = elevatorId;
    }

    setFloor(floor){
        this.floor = floor;
    }

    setMoving(move){
        this.moving = move;
    }
    getFloor(){
        return this.floor;
    }
    isOccupied(){
        return this.moving;
    }
}

// Class to implement a queue for the elevators.
class Queue {
    constructor(){
        this.items = [];
    }

    isEmpty(){
        return this.items.length == 0;
    }

    enqueue(item){
        this.items.push(item);
    }
    
    dequeue(){
        if(!this.isEmpty()){
            return this.items.shift();
        }
        return null;
    }
}

// Class to create the sound when the elevator arrives at the desired floor.
class ElevatorDing{
    constructor(src){
    this.sound = document.createElement("audio");
    this.sound.src = src;
    }
    play(){
      this.sound.play();
    }
}

// function to create the HTML tags along with some CSS styling.
function createElements() {
    var buttons = document.createElement("div");
    buttons.setAttribute("id", "buttons");
    buttons.style.left = ((ELEVATORS_NUM)*67).toString();
    // creating the elevators.
    for (var i =0; i<ELEVATORS_NUM; i++){
        var newElevatorDiv = document.createElement("div");
        var newCarDiv = document.createElement("div");
        newCarDiv.setAttribute("class", "car");
        newCarDiv.setAttribute("id", "car" + (i+1).toString());
        newElevatorDiv.setAttribute("id", "elevator" + (i+1).toString());
        newElevatorDiv.setAttribute("class", "elevator");
        newElevatorDiv.style.height = (FLOOR_NUM*45).toString() + "px";
        newElevatorDiv.style.left = (i*67).toString() + "px";;
        newElevatorDiv.appendChild(newCarDiv);
        document.getElementById("elevators").appendChild(newElevatorDiv);

        
    }
    // creating the buttons and the time stamps for the elevators.
    var temp = FLOOR_NUM - 1;
    
    for (var j = 0; j < FLOOR_NUM; j++){
        var fNumber = "floor" + (temp).toString();
        var tNumber = "time" + (temp).toString();
        var buttonDiv = document.createElement("div");
        var flexContainer = document.createElement("div");
        flexContainer.setAttribute("class", "flex-container");
        buttonDiv.setAttribute("class", "flex-child btn");
        var button = document.createElement("button");
        button.setAttribute("onclick", "setTimer("+temp+", "+fNumber+", "+tNumber+")");
        button.setAttribute("id", "floor" + (temp).toString());
        button.setAttribute("class", "button");
        button.textContent = (temp).toString();
        buttonDiv.appendChild(button);
        var timeDiv = document.createElement("div");
        timeDiv.setAttribute("class", "flex-child time");
        timeDiv.setAttribute("id", "time" + (temp).toString());
        var stopWatchSeconds = document.createElement("label");
        var stopWatchColon = document.createElement("label");
        var stopWatchMiliseconds = document.createElement("label");
        stopWatchSeconds.setAttribute("id", "seconds" + (temp).toString());
        stopWatchColon.setAttribute("id", "colon" + (temp).toString());
        stopWatchMiliseconds.setAttribute("id", "miliseconds" + (temp).toString());
        stopWatchSeconds.textContent = "00";
        stopWatchColon.textContent = ":";
        stopWatchMiliseconds.textContent = "00";
        var stopWatch = document.createElement("div");
        stopWatch.setAttribute("class", "flex-child stopwatch");
        stopWatch.setAttribute("id", "stopwatch" + + (temp).toString());
        stopWatch.appendChild(stopWatchSeconds);
        stopWatch.appendChild(stopWatchColon);
        stopWatch.appendChild(stopWatchMiliseconds);
        flexContainer.appendChild(buttonDiv);
        flexContainer.appendChild(stopWatch);
        flexContainer.appendChild(timeDiv);
        buttons.appendChild(flexContainer);
        temp--;
    }
    
    buttons.style.left = (((67*ELEVATORS_NUM)+15).toString() + "px");
    document.getElementById("elevators").appendChild(buttons);
}

// adding an event listener so when the dom is loaded we can add the elements to it.
document.addEventListener("DOMContentLoaded", createElements);

// function to change the state of the button the either disabled or not and change the color accordingly.
function changeButtonState(buttonId, color){
    buttonId.style.backgroundColor = color;
    color == 'red' ? buttonId.disabled = true : buttonId.disabled = false;
}

// funtion to find the nearest elevator that is also available (not in motion)
function findNearestAvailableElevator(floorNumber){
    var nearestElev = null;
    var smallestDistance = FLOOR_NUM + 1;
    var tempDistance = null;
    for (let i=0; i<elevators.length; i++){
        // elevator is available - need to check distance.
        if (!(elevators[i].isOccupied())){
            tempDistance = Math.abs(elevators[i].getFloor() - floorNumber);
            if (smallestDistance > tempDistance){
                nearestElev = elevators[i];
                smallestDistance = tempDistance;
            }
        }
    }
    // set it to moving since it will be taken from this point.
    if (nearestElev!= null){
        nearestElev.setMoving(true);
    }
    return nearestElev;
}

// function to pad zeros for stopwatch.
function padZeros(val){
    var valString = val + "";
    if(valString.length < 2)
    {
        return "0" + valString;
    }
    else
    {
        return valString;
    }
}

// function that sets a timer when user clicks the elevator button.
function setTimer(floorNumber, buttonId, timeId){
    var timerInterval;
    // get the start time, if it was in the queue we will get the original start time.
    time = new Date().getTime();
    // change the button to disabled.
    changeButtonState(buttonId, 'red');
    var secondsLabel = document.getElementById("seconds" + floorNumber.toString());
    var milisecondsLabel = document.getElementById("miliseconds" + floorNumber.toString());
    var totalMiliseconds = 0;
    timerInterval = setInterval(timer, 10);
    function timer(){
        ++totalMiliseconds;
        milisecondsLabel.innerHTML = padZeros(totalMiliseconds%100);
        secondsLabel.innerHTML = padZeros(parseInt(totalMiliseconds/100));
    }
    buttonClicked(floorNumber, buttonId, timeId, time, timerInterval)
}

// what happens when a user clicks a button right after a timer is set.
function buttonClicked(floorNumber, buttonId, timeId, time, timerInterval){
    var start = null;
    var nearestElevator = null;
    // get the start time, if it was in the queue we will get the original start time.
    time == null ? start = new Date().getTime() : start = time;
    if ((nearestElevator = findNearestAvailableElevator(floorNumber)) == null){
        // save the floor number and the time of calling.
        queue.enqueue(floorNumber);
        startTimeQueue.enqueue(start);
        timerIntervalQueue.enqueue(timerInterval);
        return;
    }
    // check if needs to go up or down.
    var up = nearestElevator.getFloor() < floorNumber ? true : false;
    var elem = document.getElementById(nearestElevator.carId);
    var pos = elem.offsetTop;
    var startPos = pos;
    var endPos;
    // calculate the Y axis position that the elevator needs to get to.
    if (up){
        endPos = startPos - 45*(Math.abs(floorNumber) - nearestElevator.getFloor());
    } else {
        endPos = startPos - 45*(Math.abs(floorNumber) - nearestElevator.getFloor());
    }
    var id = setInterval(frame, 10);
    function frame(){
        var secondsLabel = document.getElementById("seconds" + floorNumber.toString());
        var milisecondsLabel = document.getElementById("miliseconds" + floorNumber.toString());
        if (pos == endPos){
            var end = new Date().getTime();
            new ElevatorDing("ding.mp3").play();
            clearInterval(id);
            clearInterval(timerInterval);
            // set the amount of time the elevator took to arrive.
            timeId.innerHTML = ((end-start)/1000 + "sec");
            // wait on floor for 2 seconds then erase the time and unoccupy the elevator.
            setTimeout(() => {
                timeId.innerHTML = "";
                milisecondsLabel.innerHTML = "00";
                secondsLabel.innerHTML = "00";
                // changing button back to available.
                changeButtonState(buttonId, '#00ff15');
                nearestElevator.setMoving(false);
                nearestElevator.setFloor(floorNumber);
                // the elevator is now available and we need to pull from the queue should there be something.
                if (!queue.isEmpty()){
                    var nextFloorNumber = queue.dequeue();
                    var originalStartTime = startTimeQueue.dequeue();
                    var originalTimeInterval = timerIntervalQueue.dequeue();
                    buttonClicked(nextFloorNumber, document.getElementById("floor" + nextFloorNumber.toString()),
                    document.getElementById("time" + nextFloorNumber.toString()), originalStartTime, originalTimeInterval)
                }}, 2000);
        } else if(up){
            pos--;
            elem.style.top = pos + "px";
        } else {
            pos++;
            elem.style.top = pos + "px";
        }
    }
}

// create queues for when elevators aren't vacant.
var queue = new Queue();
var startTimeQueue = new Queue();
var timerIntervalQueue = new Queue();
var ELEVATORS_NUM;
var FLOOR_NUM;
var elevators = []

// get user input as to how many elevators and floors.
do {
    
    ELEVATORS_NUM = prompt("Enter Number of Elevators.");
    FLOOR_NUM = prompt("Enter Number of Floors.");

} while ((isNaN(parseInt(ELEVATORS_NUM)) || isNaN(parseInt(FLOOR_NUM))) ||
         (parseInt(ELEVATORS_NUM) <= 0 || parseInt(FLOOR_NUM)<=0));

// create elevators and add them to a list.
for (let k = 0; k<ELEVATORS_NUM; k++){
    elevators.push(new MovingElevator("car" + (k+1).toString()));
}
