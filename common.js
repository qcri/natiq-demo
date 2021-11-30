function renderAudio(jobId, current) {
    current.append(
      '<audio  class="center w-1/2 margin-tb" controls src="https://tts.qcri.org/api/audio/' +
        jobId +
        '.wav" >' +
        "</audio>"
    );
  }

function toggleLoading(current) {
    current.toggleClass("hidden");
  }

function addDotToString(textArray) {
    let newArray = [];
    for (let i = 0; i < textArray.length; i++) {
      textArray[i] = textArray[i].trim();
      if(textArray[i] != ""){
        let lastChar = textArray[i].substr(textArray[i].length - 1);
        if (lastChar == "." || lastChar == "،") {
          newArray.push(textArray[i]);
        } else {
          newArray.push(textArray[i] + ".");
       }
      }
    }
    return newArray;
  }

  function exposeSplittedResult(resultsList) {
    let result =  '';
    for (const text of resultsList) {
      trimmedText = text.trim();
      if(trimmedText != "." && trimmedText != "،"){
        result +=
          '<div class="ready-to-speak">' +
          '<textarea class="split-text w-full text-base border-b border-gray-300 focus:outline-none focus:border-indigo-500 big-font box-border" >' +
          trimmedText +
          "</textarea>" +
          '<div class="center hidden loading-wrapper">  <span class="loading"></span></div>' +
          "</div>";

      }
    }
    $("#diacritized-results").html(result);
  }

  function countWords(text){
    return $.trim(text).split(' ').filter(function(v){return v!==''}).length
  }

  function exposeResult(text) {
    let joined_split_text = ''
    if(text != ""){
      joined_split_text = autoJoinSplitText(text)
    }
    let result = "";
    result =
     ' <div id="diacritizedText" contenteditable="true" class="w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 font-small-custom rtl box-dimen processed-result">' +
     joined_split_text +
      "</div>";
    $("#diacritized-results").html(result);
  }

  function autoJoinSplitText(text)
  {
    splitArray = text.split(/[،!.:؟]+/);
    const modifiedSplitArray = splitArray.map(text => {  
      if(countWords(text) > 20){
        text = '<span contenteditable="true" class= "inner-text highlight" >'+text+'</span>'
      }else{
        text = '<span contenteditable="true" class="inner-text">'+text+'</span>'
      }
      return text;
    });
   
    return modifiedSplitArray.join('</br>')
  }

  function submitTTSJob(text, current) {
    toggleLoading(current.children(".loading-wrapper"));
    audio_gender= $('input[name=gender]:checked').val()
    model_id = "46cc0d3b-d4c7-490c-a9c1-f290d8e8427c"; 
    if(audio_gender == 'Male')
      model_id =  "f40fd5e2-9280-45b3-b17d-f0e67e322d4e";

    
    fetch("https://tts.qcri.org/api/submit_job", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        model_id: model_id,
        text: text,
        is_public: false,
      }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        promise1 = new Promise(async (resolve, reject) => {
          res = await checkStatus(result.job_id, current);
          if (res == result.job_id) {
            resolve(result.job_id);
          }
        }).then((jobId) => {
          toggleLoading(current.children(".loading-wrapper"));
          renderAudio(jobId, current);
        });
      });
  }

  async function checkStatus(jobId, current) {
    return fetch("https://tts.qcri.org/api/get_status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        job_id: jobId,
      }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(async function (response) {
        if (response.status != "Done") {
          return await delay(15000, jobId).then((jobId) =>
            checkStatus(jobId, current)
          );
        }
        return jobId;
      });
  }
  
function delay(t, v) {
    return new Promise(function (resolve) {
      setTimeout(resolve.bind(null, v), t);
    });
  }