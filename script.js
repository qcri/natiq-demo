$("document").ready(function () {
  $("#split-btn").click(function (e) {
    e.preventDefault();
    let splittedArray = []
    $('#diacritizedText').find("span").each( (index, element) => {
      splittedArray.push(element.innerText)
    })
      arrayOfText = addDotToString(splittedArray);
      exposeSplittedResult(arrayOfText);

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
          validateSplitText($("#diacritizedText").children(".highlight"))
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
      validateSplitText($("#diacritizedText").children(".highlight"))
    }
  })


  $(".speaker-btn").on("click", function (e) {
      e.preventDefault();
      $(".ready-to-speak").each(function(index, element){
       line = $(element).children(".split-text").val() 
        jobId = submitTTSJob(line, $(element));
      })

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

function checkContentEdits(event){
  console.log("yeees")
  return true;
}

  $(document).on('change keyup paste', '#diacritizedText', function(e) { 
    e.stopPropagation();
    var key = e.which || e.which;

    if( key == 8 || key == 46 ){
       $('#diacritizedText').find("span").each( (index, element) => {
        // if(!$(element).is('br') && $(element).is('span') && !$(element).hasClass('inner-text')){
        //   console.log("merge", $(element))
        // }
        if(!$(element).is('br') && $(element).is('span') && $(element).next().is('span')){
          console.log("merge", $(element))
          console.log($(element).text())
          
          $(element).append($(element).next().text()).end()
          $(element).next().remove().end()
        }
       })
       
    }
 
  $('#diacritizedText').find("span").each( (index, element) => {
    if($(element).is('br')){
      return
    }
    count = countWords(element.innerText)
     if(countWords(element.innerText) > 20){
       $(element).addClass('highlight')
        }else{
          $(element).removeClass('highlight')
          $(element).find("*").removeClass('highlight')
        }
    })
      validateSplitText($(this).children(".highlight"))

  });

  function validateSplitText(element){
    if(element.length > 0 )
      disableButton($("#split-btn"))
    else
      enableButton($("#split-btn"))
  }

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
    $("#splitted-diacritized-results").html(result);
  }

  function countWords(text){
    return $.trim(text).split(' ').filter(function(v){return v!==''}).length
  }

  function exposeResult(diacritized_text) {
    let joined_split_text = ''
    if(diacritized_text != ""){
      joined_split_text = autoJoinSplitText(diacritized_text)
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
    model_id = "0637246f-a4d7-43da-a3ce-e690b40f7fd0"; 
    if(audio_gender == 'Male')
      model_id =  "0e304539-8e0b-4388-b6a5-aa720b418a7a";

    
    fetch("https://tts.qcri.org/api/submit_job", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        model_id: model_id,
        text: text,
        is_public: false,
        diac: false  //override daiacritization on server side
      }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        promise1 = new Promise(async (resolve, reject) => {
          res = await checkStatus(result.job_id, current);
          if (res == result.job_id) {
            console.log(res)
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
});
