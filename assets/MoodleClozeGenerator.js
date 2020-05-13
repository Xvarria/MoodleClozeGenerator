var questions = new Object();

$(document).ready(function() {
	$('#optionSequence').val(0);
	$('#questionSequence').val(0);
});

function getNextOptionSequence(){
	var nextVal = Number($('#optionSequence').val()) + 1;
	$('#optionSequence').val(nextVal);
	return nextVal;
}

function getNextQuestionSequence(){
	var nextVal = Number($('#questionSequence').val()) + 1;
	$('#questionSequence').val(nextVal);
	return nextVal;
}

function validateOption(type){
	var errorMessage = "";
	var sufix = "";
	if (type == "edit"){
		sufix = "Edit";
	}
	var option = $("#option"+sufix).val().trim();
	if (option == ''){
		errorMessage = "Option value can not be empty"
	}
	var percent = $("#percent"+sufix).val().trim();
	var perNum = Number(percent);
	if (percent != '' && perNum == NaN){
		errorMessage = errorMessage + "\nPercentage value must be a number or empty";
	}
	if (perNum > 100 || perNum < 0){
		errorMessage = errorMessage + "\nPercentage value must be between 0 and 100 ";
	}
	return errorMessage;
}

function addOption(){
	var optionNumber = getNextOptionSequence();
	var type = $('#type option:selected').val();
	//TODO add restriction for single option

	var questionName = $('#name').val();
	var questionNameEdit = $('#nameEdit').val();

	if (questionName == '' && questionNameEdit == ''){
		alert("Please define a name before add options");
	}else{
		var message = validateOption("add");
		if (message.trim() != ''){
			alert(message);
		}else{
			var optionList = getOptionList();
			var option = getOptionFromFields("add");
			
			optionList.push(option);
			$('#optionJson').val(JSON.stringify(optionList));

			renderOptionTable();	
			cleanAddFields();
		}
	}
}

function deleteOption(optionId){
	if (confirm("Are you sure you want to remove this option?")){
		var optionList = getOptionList();	
		var optionListNew = [];
		jQuery.each(optionList, function(index, optionObj){
			if (optionObj.id != optionId){
				optionListNew.push(optionObj);
			}			
		});
		$('#optionJson').val(JSON.stringify(optionListNew));
		renderOptionTable();
	}
}

function editOption(optionId){
	var lastId = "";
	var optionList = getOptionList();
		
	var found = false;
	jQuery.each(optionList, function(index, optionObj){
	  if (optionObj.id == optionId){
		found = true;
		editObject = optionObj;
		return false; //Break the foreach
	  }
	});
	if (found){
		$('#trOptionAdd').addClass("hidden");
		$("#trOptionEdit").removeClass("hidden");
		$("#optionEdit").val(editObject.option);
		$("#isCorrectEdit").attr('checked',editObject.isCorrect);
		$("#percentEdit").val(editObject.percent);
		$("#feedbackEdit").val(editObject.feedback);
		$("#optionId").val(editObject.id);
		$("#optionBeforeId").val(lastId);
	}
}

function saveOption(){
	var message = validateOption("edit");
	if (message.trim() != ''){
		alert(message);
	}else{
		var id=$("#optionId").val();
		var lastId = $("#optionBeforeId").val();
		var optionList = getOptionList();
		var option = getOptionFromFields("edit");
		
		$(optionList).each(function(index, optionObj){
			if (optionObj.id == id){
				optionObj.option = option.option;
				optionObj.percent = option.percent;
				optionObj.feedback = option.feedback;
				optionObj.isCorrect = option.isCorrect;
				optionObj.isCorrectDesc = option.isCorrectDesc;			
				return false; // breaks
			}
		});
		$('#optionJson').val(JSON.stringify(optionList));
		renderOptionTable();
		
		cleanEditFields();
		$('#trOptionAdd').removeClass("hidden");
		$("#trOptionEdit").addClass("hidden");
	}
}

function getOptionList(){
	var json = $('#optionJson').val().trim();
	var optionList = [];
	if (json != ''){
		optionList = JSON.parse(json);
	}
	return optionList;
}

function getOptionFromFields(type){
	var optionObj = new Object();
	var sufix = "";
	if (type == "edit"){
		sufix = "Edit";
		optionObj.id = $('#optionId').val();
	}else{
		var optionNumber = getNextOptionSequence();
		optionObj.id = "Option_"+optionNumber;
	}

	optionObj.option = $("#option"+sufix).val();;
	optionObj.percent = $("#percent"+sufix).val();
	optionObj.feedback =  $("#feedback"+sufix).val();
	optionObj.isCorrect = $("#isCorrect"+sufix).prop('checked');
	optionObj.isCorrectDesc = $("#isCorrect"+sufix).prop('checked') ? "Y" : "N";
	return optionObj;
}

function renderOption(option){
	var param="'"+option.id+"'";
	var editBtn = '<input id="add" type="button" value="edit" onclick="javascript:editOption('+param+')"/>';
	var deleteBtn = '<input id="add" type="button" value="delete" onclick="javascript:deleteOption('+param+')"/>';			

	$('#trOptionAdd').before("<tr id="+option.id+"><td>"+option.option+"</td><td>"+option.isCorrectDesc+"</td><td>"+option.percent+"</td><td>"+option.feedback+"</td><td>"+editBtn+deleteBtn+"</td><tr>");
}

function renderOptionTable(){
	$('#options tr').each(function(index, optionTr){
		if(optionTr.id != 'optionHeader' && optionTr.id != 'trOptionAdd' && optionTr.id != 'trOptionEdit'){
			optionTr.remove()
		}
	});
	
	var optionList = getOptionList();
	jQuery.each(optionList, function(index, option){
		renderOption(option);
	});
}

function cancelEdit(){
	cleanEditFields();
	$('#trOptionAdd').removeClass("hidden");
	$("#trOptionEdit").addClass("hidden");
}

function cleanEditFields(){
	$("#optionEdit").val("");
	$("#isCorrectEdit").prop("checked",false);
	$("#percentEdit").val("");
	$("#feedbackEdit").val("");
	$("#optionId").val("");
	$("#optionBeforeId").val("");	
}

function cleanAddFields(){
	$("#option").val("");
	$("#isCorrect").prop('checked',false);
	$("#percent").val("");
	$("#feedback").val("");
}

function getQuestionFromFields(type){
	var question = new Object();
	var sufix = "";
	if (type == "edit"){
		sufix = "Edit";
		question.id = $('#questionId').val();
	}else{
		var questionNumber = getNextQuestionSequence();
		question.id = "QUESTION_"+questionNumber;
	}
	question.name = $('#name'+sufix).val();
	question.type = $('#type'+sufix+' option:selected').val();
	question.typeDescription = $('#type'+sufix+' option:selected').html();
	question.points = $('#points'+sufix).val();
	question.catchAllFeedback = $("#catchAllFeedback"+sufix).val();
	var optionList = [];
	var json = $('#optionJson').val().trim();
	if (json != ''){
		optionList = JSON.parse(json);
	}
	question.optionList = optionList;
	return question;
}

function getOptionSummary(question){
	var optionListSummary = "";
	var optionList = question.optionList;
	if (optionList.length > 0){
		jQuery.each(optionList, function(index, option){
			if (optionListSummary != ""){
				optionListSummary = optionListSummary + "<br>";
			}
			optionListSummary = optionListSummary + option.option + (option.isCorrect ? "*" : "") + (option.percent != "" ? (" " + option.percent + "%") : "");
		});
	}
	return optionListSummary;
}

function getQuestionList(){
	var json = $('#questionJson').val().trim();
	var questionList = [];
	if (json != ''){
		questionList = JSON.parse(json);
	}
	return questionList;
}

function addQuestion(){
	var message = "";//validateOption("add"); //TODO add validate question
	if (message.trim() != ''){
		alert(message);
	}else{
		var question = getQuestionFromFields(add);
		var questionList = getQuestionList();
		
		questionList.push(question);
		$('#questionJson').val(JSON.stringify(questionList));

		renderQuestionTable();
		cleanAddQuestionFields();
	}
}

function deleteQuestion(questionId){
	if (confirm("Are you sure you want to remove this Question?")){
		var json = $('#questionJson').val().trim();

		var questionListNew = [];
		var questionList = getQuestionList();
		jQuery.each(questionList, function(index, question){
		  if (question.id != questionId){
			questionListNew.push(question);
		  }
		});

		$('#questionJson').val(JSON.stringify(questionListNew));
		renderQuestionTable();
	}
}

function editQuestion(optionId){
	var lastId = "";
	var questionList = getQuestionList();
	
	var found = false;
	jQuery.each(questionList, function(index, questionObj){
	  if (questionObj.id == optionId){
		found = true;
		editObject = questionObj;
		return false; //Break the foreach
	  }
	});
	if (found){
		$('#trQuestionAdd').addClass("hidden");
		$('#trQuestionAdd2').addClass("hidden");
		$('#trQuestionAddBtn').addClass("hidden");
		$("#trQuestionEdit").removeClass("hidden");
		$("#trQuestionEdit2").removeClass("hidden");
		$("#trQuestionEditBtn").removeClass("hidden");
		$("#nameEdit").val(editObject.name);
		$("#typeEdit option").each(function(index, option){
			if($(this).val() == editObject.type){
				$(this).attr("selected",true);
			}
		});
		$("#isCorrectEdit").attr('checked',editObject.isCorrect);
		$("#catchAllFeedbackEdit").val(editObject.catchAllFeedback);
		$("#pointsEdit").val(editObject.points);
		$("#questionId").val(editObject.id);
		$("#optionJson").val(JSON.stringify(editObject.optionList));
		renderOptionTable();
	}
}

function saveQuestion(){
	var message = "";//validateOption("edit");
	if (message.trim() != ''){
		alert(message);
	}else{
		var id=$("#questionId").val();
		var questionList = getQuestionList();
		var question = getQuestionFromFields("edit");
		
		$(questionList).each(function(index, questionObj){
			if (questionObj.id == id){
				questionObj.name = question.name;
				questionObj.type = question.type;
				questionObj.points = question.points;
				questionObj.optionList = question.optionList;
				return false; // breaks
			}
		});
		$('#questionJson').val(JSON.stringify(questionList));
		renderQuestionTable();
		
		cleanQuestionEditFields();
		$('#trQuestionAdd').removeClass("hidden");
		$('#trQuestionAddBtn').removeClass("hidden");
		$('#trQuestionAdd2').removeClass("hidden");
		$("#trQuestionEdit").addClass("hidden");
		$("#trQuestionEditBtn").addClass("hidden");
		$("#trQuestionEdit2").addClass("hidden");
	}
}

function cancelEditQuestion(){
	$('#trQuestionAdd').removeClass("hidden");
	$('#trQuestionAddBtn').removeClass("hidden");
	$('#trQuestionAdd2').removeClass("hidden");
	$("#trQuestionEdit").addClass("hidden");
	$("#trQuestionEditBtn").addClass("hidden");
	$("#trQuestionEdit2").addClass("hidden");
}

function renderQuestion(question){
	var param="'"+question.id+"'";
	var editBtn = '<input id="editQuestion" type="button" value="edit" onclick="javascript:editQuestion('+param+')"/>';
	var deleteBtn = '<input id="deleteQuestion" type="button" value="delete" onclick="javascript:deleteQuestion('+param+')"/>';
	renderCloze(question);
	$('#questionTblFtr').before("<tr id="+question.id+"><td>"+question.name+"</td><td>"+question.typeDescription+"</td><td>"+question.points+"</td><td>"+getOptionSummary(question)+"</td><td>"+question.cloze+"</td><td>"+editBtn+deleteBtn+"</td><tr>");
}

function renderQuestionTable(){
	$('#questionTbl tr').each(function(index, optionTr){
		if(optionTr.id != 'questionTblHdr' && optionTr.id != 'questionTblFtr'){
			optionTr.remove()
		}
	});
	
	var questionList = getQuestionList();
	jQuery.each(questionList, function(index, question){
		renderQuestion(question);
	});
}

function cleanAddQuestionFields(){
	cleanQuestionFields("add");
}

function cleanQuestionEditFields(){
	cleanQuestionFields("edit");
}

function cleanQuestionFields(type){
	var sufix = "";
	if (type == "edit"){
		sufix = "Edit";
		$("#questionId").val("");
		$("#questionBeforeId").val("");
	}
	$("#name"+sufix).val("");
	$("#points"+sufix).val(1);
	$('#type option').attr("selected",false);
	$("#optionJson").val("");	
	$('#options tr').each(function(index, optionTr){
		if(optionTr.id != 'optionHeader' && optionTr.id != 'trOptionAdd' && optionTr.id != 'trOptionEdit'){
			optionTr.remove()
		}
	});
}

function renderCloze(question){
	var cloze = "";
	var options = "";
	cloze = "{" + question.points +":"+question.type+":";
	jQuery.each(question.optionList, function(index, element){
		if(options != ''){
			options = options + "~";
		}
		options =  options + (element.isCorrect ? "=" : (element.percent == "" ? "%0%" : "%"+element.percent+"%")) + element.option +"#"+ element.feedback;
	});	
	var canHaveLastFeedback = question.catchAllFeedback != '' && question.type == 'SA';
	var lastFeedback = (canHaveLastFeedback ? "~*"+question.catchAllFeedback : "");

	cloze = cloze + options + lastFeedback  + "}";
	question.cloze=cloze;	
}

function renderResponse(){
	var questionList = getQuestionList();
	var input = $('#question').val();
	jQuery.each(questionList, function(index, question){
		renderCloze(question)
		input = input.replace(question.name, question.cloze);
	});
	$('#output').val(input);
}

function toogleTextArea(){
	if ($("#questionJson").hasClass("hidden")){
		$("#questionJson").removeClass("hidden");
		$("#renderTbl").removeClass("hidden");
	}else{
		$("#questionJson").addClass("hidden");
		$("#renderTbl").addClass("hidden");
	}
}