var data;
var answers = {};
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
  if (answer !== 'skip') {
    answers[n] = answer;

    for (var i = 0; i < data.subjects[n].parties.length; i++) {
      if (data.subjects[n].parties[i].position === answer) {
        parties[i].score += 1;
      }
    }
  }
  if (n < data.subjects.length - 1) {
    n ++;
    changeQuestionText();
  }
  else {
    document.getElementById('questions').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    var result =  parties.sort(function(a, b) {
      return parseFloat(b.score) - parseFloat(a.score);
    });
    for (var i = 0; i < 5; i++) {
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
      ocument.getElementById('party').parentNode.removeChild(elem);
    }
  }
}
