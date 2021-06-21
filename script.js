 
  $("document").ready(function(){
     $("#diacritize_btn").click(function (e) {
        e.preventDefault();
        var text = $("#plainText").val();
     
        if (text.includes("\n")) {
            splittedArray = text.split("\n");
        }
        else 
            splittedArray = [text]    
        arrayOfText = addDotToString(splittedArray)
        text = arrayOfText.join("\n");
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
            response_json = JSON.parse(response);
            if (response_json.text.includes("\n")) {
              let result_array = response_json.text.split("\n");
             
              exposeResult(result_array);
            } else {
              exposeResult([response_json.text]);
            }
          }
        });
      });
      function addDotToString(textArray){
        let newArray = []
        for(let i=0;i < textArray.length; i++){
          textArray[i] = textArray[i].trim();
          let lastChar = textArray[i].substr(textArray[i].length - 1);  
            if (lastChar == '.' || lastChar =='،'){
                newArray.push(textArray[i])
            }
            else  {
                console.log(textArray[i]+".")
                newArray.push(textArray[i]+".")
                console.log(newArray[i])
            }
          }
          return newArray
      }

      function exposeResult(resultsList) {
        let result = '';
        let resultTitle ='<div class="flex items-center justify-center space-x-2">'+
        '<span class="h-px w-16 bg-gray-300"></span>'+
        '<span class="text-blue-500 font-normal">Dictirized text</span>'+
        '<span class="h-px w-16 bg-gray-300"></span>';
        for (const text of resultsList) {
        result +=
        '<div class="processed-result">'+
        '<textarea id="plainText" class="w-11/12 text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500" >' + text + '</textarea>' +
        '<button value="speak" class="speaker-btn"></button>'+
        '<div class="center hidden loading-wrapper">  <span class="loading"></span></div>'+
        '</div>';        
        }
        console.log(result)
        $("#result-title").html(resultTitle);
        $("#diacritized-results").html(result);
    }  
    
     $("#diacritized-results").on("click", ".speaker-btn", function(e){
         let current = $(this);
        e.preventDefault();
        let text = $(this).prev().val();
        jobId= submitTTSJob(text, current);        
    })

    function delay(t, v) {
        return new Promise(function(resolve) { 
            setTimeout(resolve.bind(null, v), t)
        });
    }

    function submitTTSJob(text, current){
      toggleLoading(current)
       fetch('https://tts.qcri.org/api/submit_job', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                        "model_id": "13ff0d6e-bf12-4035-a116-3456e304bda7",
                        "text": text,
                        "is_public": true
                    })
          }).then(function(response){ 
              return response.json()
            })
          .then(function(result){ 
        promise1 = new Promise(async(resolve, reject) => {
            res = await checkStatus(result.job_id, current)
            if (res == result.job_id){
                 resolve( result.job_id)
            }
        })
        .then((jobId) => {
            toggleLoading(current)
            renderAudio(jobId, current)
        }) 
        })

    
    }
    
    async function checkStatus(jobId, current){   
        return fetch('https://tts.qcri.org/api/get_status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                "job_id": jobId
                    })
          }).then(function(response){  
            return response.json();
            }).then(async function(response){ 
             if(response.status !="Done"){
                return await delay(5000, jobId).then((jobId)=> checkStatus(jobId, current))
             }
             return jobId;
          
            })
  }

  function renderAudio(jobId, current){
         current.after('<audio  class="center w-1/2 margin-tb" controls preload="none" src="https://tts.qcri.org/api/audio/'+jobId+'.wav" >'+
        '</audio>')
  }

  function toggleLoading(current){
    current.siblings('.loading-wrapper').toggleClass('hidden')
  }
 })
