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
 });
