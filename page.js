$("document").ready(function () {
   default_text = "معركة اليرموك، وقعت بين المسلمين والروم (الإمبراطورية البيزنطية)، ويعتبرها بعض المؤرخين من أهم المعارك في تاريخ العالم لأنها كانت بداية أول موجة انتصارات للمسلمين خارج جزيرة العرب.  وآذنت لتقدم الإسلام السريع في بلاد الشام  .المعركة حدثت بعد وفاة الرسول محمد صلى الله عليه وسلم بأربع سنوات."
   exposeResult(default_text)
 

  $(".speaker-btn").on("click", function (e) {
      e.preventDefault();
      if ($('#diacritized-results p').length > 0){  // check if user paste or delete default text and add new text, then we need to
        let text = $('#diacritizedText').text() 
        exposeResult(text)
      }
      let splittedArray = []
      if(!$(".ready-to-speak")[0]){  //skip splitting if it was splitted before
        $('#diacritized-results').find("span").each( (index, element) => {
          splittedArray.push(element.innerText)
        })
        arrayOfText = addDotToString(splittedArray);
        exposeSplittedResult(arrayOfText);
      }
      $(".ready-to-speak").each(function(index, element){
       line = $(element).children(".split-text").val() 
        jobId = submitTTSJob(line, $(element));
      })

  });
  
  $(document).on('keypress paste', '#diacritizedText', function(e) { 
    text = $(this).text()
  });
});