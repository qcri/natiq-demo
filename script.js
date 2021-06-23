$("document").ready(function () {
  $("#split-btn").click(function (e) {
    e.preventDefault();
    var text = $("#diacritizedText").val();
    if(text){
      if (text.includes("\n")) {
        splittedArray = text.split("\n");
      } else
       splittedArray = [text];
      arrayOfText = addDotToString(splittedArray);
      exposeSplittedResult(arrayOfText);
    }
  

  });


  $("#diacritize_btn").click(function (e) {
    e.preventDefault();
    var text = $("#plainText").val();
    toggleLoading($("#diacritized-results .loading-wrapper"))
    if(text){
      var api_key = "gVyMcgLnLNHduIisHh";
      var settings = {
        async: true,
        crossDomain: true,
        url: "https://farasa.qcri.org/webapi/diacritize/",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        method: "POST",
        processData: false,
        data: "text=" + text + "&api_key=" + api_key,
      };
  
      $.ajax(settings).done(function (response) {
        if (response) {
          toggleLoading($("#diacritized-results .loading-wrapper"))
          response_json = JSON.parse(response);
          exposeResult(response_json.text);
        }
      });
    }{

    }
    
  });
  
  $("#skip_diacritization_btn").click(function (e){
    e.preventDefault();
    var text = $("#plainText").val();
    if(text){
      exposeResult(text);
    }
  })


  $("#splitted-diacritized-results").on("click", ".speaker-btn", function (e) {
    if (!$(this).hasClass("disable-speaker")) {
      let current = $(this);
      e.preventDefault();
      let text = $(this).prev().val();
      if(text != "")
        jobId = submitTTSJob(text, current);
    }
  });

  function delay(t, v) {
    return new Promise(function (resolve) {
      setTimeout(resolve.bind(null, v), t);
    });
  }

  $(document).on('change keyup paste', '#plainText', function(e) { 
  
    if(this.value == ""){
      disableButton($("#diacritize_btn"));
      disableButton($("#skip_diacritization_btn"));
      
    }else{
      enableButton($("#diacritize_btn"))
      enableButton($("#skip_diacritization_btn"))
    }
  });

  $(document).on('change keyup paste', '#diacritizedText', function(e) { 
   
    if(this.value == ""){
      disableButton($("#split-btn"));
    }else{
      enableButton($("#split-btn"))
    }
  });

  $(document).on('change keyup paste', '.splitted-text', function(e) { 
    text = this.value;
    if(countWords(text) <20)
    {
      $(this).removeClass('warning')
      $(this).siblings('.speaker-btn').removeClass('disable-speaker')
    }else{
      $(this).addClass('warning')
      $(this).siblings('.speaker-btn').addClass('disable-speaker')
    }
  });



  function disableButton(button){
    button.prop('disabled', true);
    button.addClass("disabled"); 
  }
  function enableButton(button){
    button.prop('disabled', false);
    button.removeClass("disabled"); 
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
    let result =  "";
    let warningClass = "";
    let disableSpeaker = "";
    let warning = "The length of this text exceeds 20 words."
    for (const text of resultsList) {
      trimmedText = text.trim();
      if(trimmedText != "." && trimmedText != "،"){
        if(countWords(trimmedText) > 20 ){
          warningClass = "warning";
          disableSpeaker= "disable-speaker"
        }
        result +=
          '<div class="processed-result" title="' + warning + '">' +
          '<textarea class="splitted-text w-10/12 text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 big-font box-border '+ warningClass +'" >' +
          trimmedText +
          "</textarea>" +
          '<button value="speak" class="speaker-btn ' + disableSpeaker + '"></button>' +
          '<div class="center hidden loading-wrapper">  <span class="loading"></span></div>' +
          "</div>";
      }

    }

    $("#splitted-diacritized-results").html(result);
  }

  function countWords(text){
    return $.trim(text).split(' ').filter(function(v){return v!==''}).length
  }

  function exposeResult(diacritized_text) {
    let result = "";
    result =
      '<div class="processed-result">' +
      '<textarea id="diacritizedText" class="w-11/12 text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 box-dimen big-font" >' +
      diacritized_text +
      "</textarea>" +
      "</div>";
    enableButton($("#split-btn"))
    $("#diacritized-results").html(result);
  }

  function submitTTSJob(text, current) {
    toggleLoading(current.siblings(".loading-wrapper"));
    current.siblings('audio').remove()
    audio_gender= $('input[name=gender]:checked').val()
    model_id = "13ff0d6e-bf12-4035-a116-3456e304bda7"; // by default it's female
    if(audio_gender == 'Male')
      model_id =  "b9dd62cc-c99c-44e8-898e-3efdb72396bb";

    
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
          toggleLoading(current.siblings(".loading-wrapper"));
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
          return await delay(5000, jobId).then((jobId) =>
            checkStatus(jobId, current)
          );
        }
        return jobId;
      });
  }

  function renderAudio(jobId, current) {
    current.after(
      '<audio  class="center w-1/2 margin-tb" controls preload="none" src="https://tts.qcri.org/api/audio/' +
        jobId +
        '.wav" >' +
        "</audio>"
    );
  }

  function toggleLoading(current) {
    current.toggleClass("hidden");
  }
});
