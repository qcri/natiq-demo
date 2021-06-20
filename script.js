 
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
        //   console.log()
        let newArray = []
        //   for(const text of textArray){
        for(let i=0;i < textArray.length; i++){
            let lastChar = textArray[i].substr(textArray[i].length - 1);  

            console.log(textArray[i]+"   "+lastChar)
            if (lastChar == '.' || lastChar =='،'){
                newArray.push(textArray[i])
            }
            else  {
                console.log(textArray[i]+".")
                newArray.push(textArray[i]+".")
                // textArray[i].replace(textArray[i], (textArray[i]+"."))
                console.log(newArray[i])
            }
          }
          console.log(newArray)
          return newArray
      }

      function exposeResult(resultsList) {
        let result = "";
        for (const text of resultsList) {
        result +=
            '<div class="processed-result"><textarea type="text" id="plainText" class="form-control">' +
            text +
            "</textarea>" +
            '<button value="speak" class="speaker-btn"></button></div>'
        
        }
        // $("#diacritized-results").html("");
        $("#diacritized-results").html(result);
    }  
    
     $("#diacritized-results").on("click", ".speaker-btn", function(e){
         let current = $(this);
        // $(".speaker-btn").on("click", function(e){
        e.preventDefault();
        let text = $(this).prev().val();
        jobId= submitTTSJob(text, current);
    //    promise1 = new Promise((resolve, reject) => {
    //         result = temp(1)
            // console.log("res", result)
            // return resolve(result)
            // resolve(checkStatus("a195bc0c-8d63-4cbd-8518-2c61a4de6dcf") );  
            // result = checkStatus("a195bc0c-8d63-4cbd-8518-2c61a4de6dcf") 
            // if(result == "Done"){
            //     console.log("yesssss")
            //    return resolve(result.job_id)
            // }
            // else
            //    return reject("No response back")   
        // })

        // promise1 = new Promise(async(resolve, reject) => {
        //     res = await temp(1)
        //     console.log(res)
        //     if (res == 5){
        //         console.log("here")
        //          resolve( res)
        //     }
        // })
        // .then(() => {
        //     console.log("heeer")
        //     // renderAudio(jobId, current)
        // }) 
        
    })
// async function temp(i){
//          i = i +1;
//         console.log("i", i)
//         if(i < 5)
//            return await delay(1000, i).then((i)=> temp(i))
//         else    {
//         // temp(i)
//         //    setTimeout(() => temp(i), 1000);
//         console.log("done") 
//         return i    
//         }
// }
function delay(t, v) {
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
    });
 }
// async function temp(i) {
//     let waitTime = 100;
//     while (true) {
//         try {
//             let val = await checkStatus("a195bc0c-8d63-4cbd-8518-2c61a4de6dcf")
//             // use break or return here to break out of the loop
//             return val;
//         } catch (ex) {
//             // Should also check if the actual error is one that is likely
//             // temporary.  Otherwise, you may loop forever on a permanent error
//             console.log("still waiting and trying again")
//             // implement super simple backoff (there are much more elegant algorithms available)
//             await delay(waitTime);
//             waitTime += 300;
//         }
//     }
// }


    function submitTTSJob(text, current){

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
            
        //     //   return checkStatus("a195bc0c-8d63-4cbd-8518-2c61a4de6dcf", current)
        //     new Promise((resolve, reject) => {  
        //         if(checkStatus(result.job_id)  == result.job_id){
        //             console.log('result is back')    
        //             resolve(result.job_id);  
        //         }
        //   }).then(jobId=> renderAudio(jobId, current)) 
        promise1 = new Promise(async(resolve, reject) => {
            res = await checkStatus(result.job_id, current)
            console.log(res)
            if (res == result.job_id){
                console.log("here")
                 resolve( result.job_id)
            }
        })
        .then((jobId) => {
            console.log("heeer")
            renderAudio(jobId, current)
        }) 
        })

    
    }
    
    async function checkStatus(jobId, current){
        
        return fetch('https://tts.qcri.org/api/get_status', {
            method: 'POST',
            // async: false,
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                "job_id": jobId
                    })
          }).then(function(response){  
            return response.json();
            }).then(async function(response){ 
                console.log("let is see", response.status)
             if(response.status !="Done"){
                // setTimeout(() => checkStatus(jobId, current), 5000);
                return await delay(5000, jobId).then((jobId)=> checkStatus(jobId, current))
             }
             return jobId;
          
            })
  }

  function renderAudio(jobId, current){
        console.log("here")
         current.after('<audio controls preload="none" src="https://tts.qcri.org/api/audio/'+jobId+'.wav" >'+
     
        '</audio>')
  }

 })
