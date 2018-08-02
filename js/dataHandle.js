//Change event to dropdownlist
$(document).ready(function(){
  $('#files').change(handleFile);
});

let dataStore;
let sortedArray;

function handleFile(e) {
     var files = e.target.files;
     var i, f;
     infoText.innerText = 'Processing your Data...'
     for (i = 0, f = files[i]; i != files.length; ++i) {
         var reader = new FileReader();
         var name = f.name;
         reader.onload = function (e) {
             var data = e.target.result;

             var result;
             var workbook = XLSX.read(data, { type: 'binary' });

             var sheet_name_list = workbook.SheetNames;
             sheet_name_list.forEach(function (y) { /* iterate through sheets */
                 //Convert the cell value to Json
                 var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
                 if (roa.length > 0) {
                     result = roa;
                 }
             });
            //Get the first column first cell value
             dataStore = result;
             infoText.innerText = 'Processing Complete';
             reduceAll();
         };
         reader.readAsArrayBuffer(f);
     }
 }


function sortData(data){
  let peopleArray = {};
  let tmpAgentName, tmpDate, tmpType;
  for(i=0; i < data.length; i++){
    tmpAgentName = data[i]['Responding Agent Name'];
    tmpDate = dataStore[i]['Date Claimed or Assigned'];
    tmpType = dataStore[i]['Response Type'];

    //Error check the Name and Date
    if(tmpAgentName == undefined){
      tmpAgentName = 'N/A';
    }
    if(tmpDate != undefined){
    //Only get the Month Day and Year
      tmpDate = tmpDate.split(" ").splice(0,1);
    } else {
      tmpDate = 'N/A';
    }

    //If name does not exist add name into object
    if(peopleArray[tmpAgentName] == undefined){
      peopleArray[tmpAgentName] = {};
    }
    //If date does not exist add date to object
    if(peopleArray[tmpAgentName][tmpDate] == undefined){
      peopleArray[tmpAgentName][tmpDate] = [];
      peopleArray[tmpAgentName][tmpDate]['PRIVATE'] = [];
      peopleArray[tmpAgentName][tmpDate]['PUBLIC'] = [];
    }
    peopleArray[tmpAgentName][tmpDate][tmpType].push(data[i]);
  }
  return peopleArray;
}

//Data format to write to Excel
function reduceDataExcel(data){
  let tmpArray = {};
  for (let key in data){
    for(let date in data[key]){
      //Return an array with one random public and private post
      //Sometimes people have no post that day
      if(data[key][date]['PUBLIC'].length != 0){
        tmpArray.push(data[key][date]['PUBLIC'][Math.floor(Math.random() * data[key][date]['PUBLIC'].length)]);
      }
      if(data[key][date]['PRIVATE'].length != 0){
        tmpArray.push(data[key][date]['PRIVATE'][Math.floor(Math.random() * data[key][date]['PRIVATE'].length)]);
      }
    }
  }
  return tmpArray;
}

//Data format to draw in HTML
function reduceData(data){
  let tmpArray = {};
  for (let key in data){
    tmpArray[key] = [];
    for(let date in data[key]){
      //Return an array with one random public and private post
      //Sometimes people have no post that day
      if(data[key][date]['PUBLIC'].length != 0){
          tmpArray[key].push(data[key][date]['PUBLIC'][Math.floor(Math.random() * data[key][date]['PUBLIC'].length)]);
      }
      if(data[key][date]['PRIVATE'].length != 0){
          tmpArray[key].push(data[key][date]['PRIVATE'][Math.floor(Math.random() * data[key][date]['PRIVATE'].length)]);
      }
    }
  }
  return tmpArray;
}

function reduceAll(){
  sortedArray = reduceData(sortData(dataStore));
  updateDropDown(Object.keys(sortedArray));
}

function updateDropDown(keys){
  let tmpHTML = '';
  $('#dropDownNames').empty();
  for(i = 0; i < keys.length; i++){
    console.log(keys[i]);
    tmpHTML += '<a class="dropdown-item" href="#" onClick="drawData(\''+keys[i]+'\')">'+keys[i]+'</a>';
  }
  $('#dropDownNames').append(tmpHTML);
  $('#dropdownMenuButton').empty().append('Employee Name');
}

function drawData(key){
  let tempTable = [];
  let array = sortedArray[key];
  let convID, platform, date, type, content;
  console.log(array);
  dropdownMenuButton.innerText = key;
  EmployeeName.innerText = key;
  $("table tbody").empty();
  for(i = 0; i < sortedArray[key].length; i++){
    console.log(sortedArray[key][i]);
    convID = sortedArray[key][i]['Conversation ID'];
    platform = sortedArray[key][i]['Response Provider'];
    date = sortedArray[key][i]['Post Responded to Published Time'];
    type = sortedArray[key][i]['Response Type'];
    content = sortedArray[key][i]['Post Responded to Content'];
    response = sortedArray[key][i]['Response Content'];
    lithiumLink = sortedArray[key][i]['LSW Conversation Link'];
    tempTable.push('<tr><th scope="row"><a href="'+lithiumLink+'">'+ convID +'</a></th><td>'+platform+'</td><td>'+date+'</td><td>'+ type +'</td><th scope="row">'+ content +'</th><th scope="row">'+ response +'</th></tr>');
  }
  for(i = 0; i < tempTable.length; i++){
    $("table tbody").append(tempTable[i]);
  }
}
