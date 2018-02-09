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
    document.getElementById('start-description').innerHTML = `Test uw politieke voorkeur aan de hand van ${data.subjects.length} stellingen`;
 });
}

init();
n = 0;

document.getElementById('partyAnsBtn').addEventListener("click", function() {
  if (document.getElementById('partyAns').style.display == 'none') {
    document.getElementById('partyAns').style.display = '';
  }
  else {
    document.getElementById('partyAns').style.display = 'none';
  }
});

function changeQuestionText() {
  document.getElementById('pro').innerHTML = '';
  document.getElementById('ambivalent').innerHTML = '';
  document.getElementById('contra').innerHTML = '';

  document.getElementById('question-title').innerHTML = (n+1) + '. ' + data.subjects[n].title;
  document.getElementById('question-text').innerHTML = data.subjects[n].statement;
  data.subjects[n].parties.forEach(function(ele) {
    var pos;
    if (ele.position === 'pro') {
      pos = 'pro';
    }
    else if (ele.position === 'ambivalent') {
      pos = 'ambivalent';
    }
    else if (ele.position === 'contra') {
      pos = 'contra';
    }

    document.getElementById(pos).innerHTML += `
      <details>
        <summary>${ele.name}</summary>
        <p>${ele.explanation}</p>
      </details>
    `;
  });
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
    if (n === 0 ) {
      document.getElementById('start').style.display = 'block';
      document.getElementById('questions').style.display = 'none';
    }
    else {
      n --;
      changeQuestionText();
    }
    
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
  var expandLink = document.getElementById('results-expand');
  var resultsHidden = document.getElementsByClassName('results-hidden');

  expandLink.addEventListener("click", function() {
    for (var i = 0; i < resultsHidden.length; i++) {
      if (resultsHidden[i].style.display == 'none') {
        resultsHidden[i].style.display = '';
        expandLink.innerHTML = `- ${resultsHidden.length} partijen`;
      }
      else if (resultsHidden[i].style.display == '') {
        resultsHidden[i].style.display = 'none';
        expandLink.innerHTML = `+ ${resultsHidden.length} partijen`;
      }
    }
  });


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
      if (i >= 5) {
        var attrStyle = document.createAttribute("style");
        attrStyle.value = "display: none";
        var attrClass = document.createAttribute("class");
        attrClass.value = "results-hidden";
        entry.setAttributeNode(attrStyle);
        entry.setAttributeNode(attrClass);
      }
      document.getElementById('party').appendChild(entry);
      if (5 == i) {
        var expandLink = document.getElementById('results-expand');
        var resultsHidden = document.getElementsByClassName('results-hidden');
        expandLink.style.display = 'block';
      }
      if (parties.length >= i) {
        expandLink.innerHTML = `+ ${resultsHidden.length} partijen`;
      }
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