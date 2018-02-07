var data;
var answers = [];
var parties = [];

function loadJSON(callback) {   
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'data.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);
 }
function init() {
 loadJSON(function(response) {
  // Parse JSON string into object
    data = JSON.parse(response);
    for (var i = 0; i < data.parties.length; i++) {
      parties.push({party: data.parties[i].name, score: 0});
    }
 });
}

init();
n = 0;
function changeQuestionText() {
  document.getElementById('question-title').innerHTML = (n+1) + '. ' + data.subjects[n].title;
  document.getElementById('question-text').innerHTML = data.subjects[n].statement;
}

function start() {
  document.getElementById('start').style.display = 'none';
  document.getElementById('questions').style.display = 'block';
  changeQuestionText();
}

function next(answer) {
  // possible answers: pro, ambivalent, contra, skip
  if (answer === 'back') {
    answers.pop();
  }
  else if (answer) {
    var bool = false;
    if (document.getElementById('qWeight').checked) {
      bool = true;
    }
    answers.push({q: n, a: answer, xtrWeight: bool});
  }
  if (document.getElementById('qWeight').checked) {
    document.getElementById('qWeight').checked = false;
  }
  if (n < data.subjects.length - 1 && answer !== 'back') {
    n ++;
    changeQuestionText();
  }
  else if (answer === 'back') {
    n --;
    changeQuestionText();
  }
  else {
    document.getElementById('questions').style.display = 'none';
    document.getElementById('options').style.display = 'block';
    document.getElementById('resultsBtn').addEventListener("click", results);
  }
}

function setOptions() {
  if (document.getElementById('big-parties').checked) {
    data.parties.forEach(function(element) {
        eleName = element.name;
      if (element.size < 15) {
        var index = parties.map(function(e) { return e.party; }).indexOf(eleName);
        if (index !== -1) {
          parties.splice(index, 1);
        }
      }
    });
  }
  if (document.getElementById('secular-parties').checked) {
    data.parties.forEach(function(element) {
        eleName = element.name;
      if (element.secular === false) {
        var index = parties.map(function(e) { return e.party; }).indexOf(eleName);
        if (index !== -1) {
          parties.splice(index, 1);
        }
      }
    });
  }
}

function results() {
  document.getElementById('options').style.display = 'none';
  document.getElementById('results').style.display = 'block';
  clacResult();
  var result =  parties.sort(function(a, b) {
    return parseFloat(b.score) - parseFloat(a.score);
  });
  setOptions();
  for (var i = 0; i < parties.length; i++) {
    if (parties[i].score !== 0) {
      var entry = document.createElement('li');
      entry.appendChild(document.createTextNode(result[i].party));
      document.getElementById('party').appendChild(entry);
    }
  }
  if (!document.getElementById('party').hasChildNodes()) {
    function insertAfter(referenceNode, newNode) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    var el = document.createElement("p");
    el.innerHTML = "Er zijn geen partijen die overeenkomen met uw antwoorden.";
    var h3 = document.getElementById("results-title");
    insertAfter(h3, el);
    document.getElementById('party').parentNode.removeChild(elem);
  }
}

function clacResult() {
  for (var b = 0; b < answers.length; b++) {
    for (var i = 0; i < data.subjects[answers[b].q].parties.length; i++) {
      if (data.subjects[answers[b].q].parties[i].position === answers[b].a) {
        if (answers[b].xtrWeight) {
          parties[i].score += 2;
        }
        else {
          parties[i].score += 1;
        }
      }
    }
  }
}