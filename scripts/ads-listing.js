/*
The following lines of code are for the constants such as kinvey credentials!
 */
const kinveyBaseUrl = "https://baas.kinvey.com/";
const kinveyAppKey = "kid_ryHiPwBO";
const kinveyAppSecret = "aadba16ca0234bce98eaf44e0298adb0";
const guestCredentials = "e9009d50-666a-47ea-b846-d7304a158b97.SYD6TI7agCiKtP18tYa6oCqha5Bt3VQ5LWLyER+xe1I=";
var currentlyLoggedUser = "";
/*
------------------------------------------------------
 */

/*
Next are the view functions!
 */
/* window.onbeforeunload = function() {
    localStorage.clear();
    localStorage.setItem('username',null);
    sessionStorage.setItem('authToken', null);
    currentlyLoggedUser = null;
};  */





function showView(viewName) {
    $('main>section').hide();
    $('#' + viewName).show();
}

function showHideMenuLinks() {
    $("#linkHome").show();
    $("#linkAbout").show();
    if(sessionStorage.getItem('authToken') == null){
        $("#linkLogin").show();
        $("#linkRegister").show();
        $("#linkMyAdds").hide();
        $("#linkListAdds").show();
        $("#linkCreateAdd").hide();
        $("#linkLogout").hide();
    }
    else{
        $("#linkLogin").hide();
        $("#linkRegister").hide();
        $("#linkMyAdds").show();
        $("#linkListAdds").show();
        $("#linkCreateAdd").show();
        $("#linkLogout").show();
    }

}

function showInfo(message) {
    $('#infoBox').text(message);
    $('#infoBox').show();
    setTimeout(function () { $('#infoBox').fadeOut()},3000);
}

function showErrorMsg(errorMsg) {
    $('#errorBox').text(errorMsg);
    $('#errorBox').show();
}

$(function () {

    showHideMenuLinks();
    showView('viewHome');

    currentlyLoggedUser = localStorage.getItem('username');
    if(currentlyLoggedUser != null){ $('#greetingsHeading').html("Greetings, " + "<span class='helloUsername'>"+ currentlyLoggedUser + "</span>");}
    else{$('#greetingsHeading').text("Greetings");}

    $('#linkHome').click(showHomeView);
    $('#linkAbout').click(showAboutView);
    $('#linkLogin').click(showLoginView);
    $('#linkRegister').click(showRegisterView);
    $('#linkMyAdds').click(showMyAddsView);
    $('#linkListAdds').click(listAdds);
    $('#linkCreateAdd').click(showCreateAddView);
    $('#linkLogout').click(logout);


    $("#formLogin").submit(function (e) {
        e.preventDefault();
        login();
    });
    $("#formRegister").submit(function (e) {
        e.preventDefault();
        register();
    });
    $("#formCreateAdd").submit(function (e) {
        e.preventDefault();
        createAdd();
    });
    $("#formModifyAdd").submit(function (e) {
        e.preventDefault();
        modifyAdd();
    });
    $(document).on({
        ajaxStart: function(){ $("#loadingBox").show()},
        ajaxStop: function() { $("#loadingBox").hide()}
    });

})

function showHomeView() {
    showView('viewHome');

    if(currentlyLoggedUser != null){ $('#greetingsHeading').html("Greetings, " + "<span class='helloUsername'>"+ currentlyLoggedUser + "</span>");}
    else{$('#greetingsHeading').text("Greetings");}

}
function showAboutView() {
    showView('viewAbout');
}

function showLoginView() {
    showView('viewLogin');
}

function showRegisterView() {
    showView('viewRegister');
}

function showCreateAddView() {
    showView('viewCreateAdd');
}

function showModifyAddView() {
    showView('viewModifyAdd');
}

/*Here we get the entire collection of advertisments posted by all users and in the loadSuccess function we select those whose
author is the same with the currentlyLoggedUser
 */
function showMyAddsView() {
    $('#myAdds').empty();
	$('#page-selection').empty();
    showView('viewMyAdds');

    const kinveyAddsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Adds?query={}&sort={\"_kmd.lmt\": -1}";

    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };

   $('body').on("click", ".buttonEdit", editAdd);
   $('body').on("click", ".buttonDelete", deleteAdd);

    $.ajax({
        method: "GET",
        url:kinveyAddsUrl,
        headers: kinveyAuthHeaders,
        success: loadMyAddsSuccess,
        error: handleAjaxError
    });


    function loadMyAddsSuccess(allAds) {
        showInfo('Your personal adds are loaded.');
        //allAds.reverse();
        if(allAds.length == 0)
            $('#myAdds').text('No adds in the database.');

        else{

          var sd = allAds.filter(function(data){return data.author === currentlyLoggedUser});


            if(sd.length ===0){
                $('#myAdds').text('No adds published by you.');
            }
			else
			{
				var ADS_PER_PAGE = 5;
				var userAdsCount = 0;
				var pages = [];
				pages[0] = $('<div class="page" id="page-1">');
				var pageIndex = 0;
				for(let add of allAds){
					if(add.author === currentlyLoggedUser){
						let adds = $('<div class="singleAdd panel-body" style="width: 90%; min-width: 200px; margin-left: 7%;" id=' +add._id + '>');
						
						if(userAdsCount % ADS_PER_PAGE == 0 && userAdsCount != 0)
						{
							pageIndex++;
							pages[pageIndex] = $('<div class="page" id="page-' + (pageIndex+1) +'">');
						}
						userAdsCount++;
						
						let singleAddHeading = $('<h1>').html(add.title);
						let singleAddAuthor = $('<p>').html("posted by " +
							"<span class='helloUsername'>" + add.author + "</span>");

                       
					let fullText = add.description;
                    let shortTxt = add.description.substring(0, 101);

                    let singleAddText = $('<p class="short">').html(shortTxt + "...");
                    let singleFullText = $('<p class="full">').html(fullText);


                    let postId = add._id;
                    let fuckingDate = add.from_date;

                    // let readMore = $('<button class="readMore btn btn-success" onClick="readMore()"></button>').html('Read More..');
                    // let hideText = $('<button class="hide btn btn-success" onClick="hide()"></button>').html('Hide...');

                    let readMore = $('<button class="readMore btn btn-success" onClick="readMore(this)"></button>').attr('id', postId).html('Read More..');
                    let hideText = $('<button class="hide btn btn-success" onClick="hide()"></button>').html('Hide...');

                    let btn_edit = $('<button class="buttonEdit btn btn-primary" data-id="'+add._id+'">').text('Edit');
                    let btn_delete = $('<button class="buttonDelete btn btn-danger" data-id="'+add._id+'">').text('Delete');

                    var singleAdd = '';


                    if(fullText.length <= 50){
                        singleFullText = $('<p class="short">').html(fullText);


                        singleAdd = [singleAddHeading,singleAddAuthor,singleFullText,btn_edit,btn_delete];


                    }else{
                        shortTxt = add.description.substring(0, 51);
                        singleAddText = $('<p class="short">').html(shortTxt + "...");
                        singleAdd = [singleAddHeading,singleAddAuthor,singleAddText, singleFullText, readMore, hideText, btn_edit, btn_delete];
                    }


                     
                    





                        

                        // var singleAdd = '';

                        // if(add.description.length >= 5){
                        //      singleAdd = [singleAddHeading,singleAddAuthor,singleAddText,btn_edit,btn_delete, link];
                        // }else {
                        //      singleAdd = [singleAddHeading,singleAddAuthor,singleAddText,btn_edit,btn_delete];
                        // }

                        //singleAdd = [singleAddHeading,singleAddAuthor,singleAddText,btn_edit,btn_delete];    

						adds.append(singleAdd);
						pages[pageIndex].append(adds);
					}
				}
				for(var index = 0; index< pages.length; index++){
					$('#myAdds').append(pages[index]);
					$('#page-selection').append('<button class="btn btn-success" style="margin-top: 10px;" onClick="showPage(' + (index+1) + ')">' + (index+1) + '</button>');
				}
			}
        }
    }
}
function showPage(pageIndex){
	$('.page').hide();
	$('#page-'+pageIndex).show();
}


/*
-----------------------------------------------------------
 */

/*
Functions suchs as login, logout and register
 */
function login() {
    const kinveyLoginUrl = kinveyBaseUrl + "user/" + kinveyAppKey + "/login";
    const kinveyAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
    };
    let userData = {
        username: $('#loginUser').val(),
        password: $('#loginPassword').val()
    };
    $.ajax({
        method: "POST",
        url: kinveyLoginUrl,
        headers: kinveyAuthHeaders,
        data: userData,
        success: loginSuccess,
        error: handleAjaxError
    });
    function loginSuccess(response) {

        localStorage.clear();
        localStorage.setItem('username',response.username);

        let userAuth = response._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);

        showHideMenuLinks();
        showView('viewHome');
        showInfo('Login successful.');
        location.reload();

    }
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response);
    if(response.readyState ===0)
        errorMsg = "Cannot connect due to network error.";
    if(response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description;
    showErrorMsg(errorMsg);
}



function register() {
    const kinveyRegisterUrl = kinveyBaseUrl + "user/" + kinveyAppKey + "/";
    const kinveyAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
    };

    let userName = $('#registerUser').val();
    let password = $('#registerPassword').val();
    let confirm = $('#confirmPassword').val();

    function validateForm() {
        if(userName.length <= 3){
            showErrorMsg("Username is too short. Minimum 3 characters");
            return false;
        }

        if(!userName[0].match(/[a-z]/)){
            showErrorMsg("Username can`t begin with digit.");
            return false;
        }

        if(!userName.match(/^[a-zA-Z0-9- ]*$/)){
            showErrorMsg("You have entered forbidden sign. Please check for @, !, ., - , and remove them");
            return false;
        }


        if(password.length < 3){
            showErrorMsg("The password is too short. Minimum 3 characters")
            return false;
        }

        if(password != confirm){
            showErrorMsg("Passwords does not match.");
            return false;
        }

        return true;
    }


    if(!validateForm()){
        return;
    }else {
        showInfo("Congratulations. Successful registration");
    }




    let userData = {
        username: $('#registerUser').val(),
        password: $('#registerPassword').val()
    };
    $.ajax({
        method: "POST",
        url: kinveyRegisterUrl,
        headers: kinveyAuthHeaders,
        data: userData,
        success: registerSuccess,
        error: handleAjaxError
    });
    function registerSuccess(response) {

        localStorage.clear();
        localStorage.setItem('username',response.username);

        let userAuth = response._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        showHideMenuLinks();
        showView('viewHome');
        showInfo('User registration successful.');
        location.reload();
    }
}

function logout() {
    sessionStorage.clear();
    localStorage.clear();
    showHideMenuLinks();
    showView('viewHome');
    location.reload();
}

/*
-------------------------------------------------------------
 */

/*
Functions for the advertisments such as listing, deleting, editing etc.
 */

function redirectMyAdvert(){
    showView('viewMyAdds');
}




function readMore(postId){
    // $('.short').hide();
    // $('.full').show();
    // $('.full').addClass('fullVisibilOn');
    // $('.readMore').hide();
    // $('.hide').show();

    let fullId = '#' + postId.id;

    $(fullId + ' .short').hide();
    $(fullId + ' .full').show();
    $(fullId + ' .full').addClass('fullVisibilOn');
    $(fullId + ' .readMore').hide();
    $(fullId + ' .hide').addClass('fullVisibilOn');
    $(fullId + ' .hide').show();

    //document.write(fullId);

}

function hide(){
    $('.short').show();
    $('.full').hide();
    $('.hide').hide();
    $('.readMore').show();
}







function listAdds() {
    $('#AllAdds').empty();
    $('#page-selectionAllAdds').empty();

    showView('viewAdds');

    const kinveyAddsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Adds?query={}&sort={\"_kmd.lmt\": -1}";
    if(sessionStorage.getItem('authToken')){
        var authToken = sessionStorage.getItem('authToken');
    }
    else{
        var authToken = guestCredentials;
    }

    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + authToken,
    };

    $.ajax({
        method: "GET",
        url:kinveyAddsUrl,
        headers: kinveyAuthHeaders,
        success: loadAddsSuccess,
        error: handleAjaxError
    });

    function loadAddsSuccess(adds) {
        showInfo('Adds loaded.');
        //adds.reverse();
        if(adds.length == 0)
            $('#AllAdds').text('No adds in the database.');



    else{

            var ADS_PER_PAGE = 5;
            var userAdsCount = 0;
            var pages = [];
            pages[0] = $('<div class="page" id="page-1">');
            var pageIndex = 0;
            for(let add of adds){
                
                    let adds = $('<div class="singleAdd panel-body" style="width: 90%; min-width: 200px; margin-left: 7%;" id=' +add._id + '>');

                    if(userAdsCount % ADS_PER_PAGE == 0 && userAdsCount != 0)
                    {
                        pageIndex++;
                        pages[pageIndex] = $('<div class="page" id="page-' + (pageIndex+1) +'">');
                    }
                    userAdsCount++;

                    let singleAddHeading = $('<h1>').html(add.title);
                    let singleAddAuthor = $('<p>').html("posted by " +
                        "<span class='helloUsername'>" + add.author + "</span>");


                    //let link = $('<a>').attr("href", "#");

                    let fullText = add.description;
                    let shortTxt = add.description.substring(0, 101);

                    let singleAddText = $('<p class="short">').html(shortTxt + "...");
                    let singleFullText = $('<p class="full">').html(fullText);


                    let postId = add._id;

                // let readMore = $('<button class="readMore" onClick="readMore()"></button>').html('Read More..');
                // let hideText = $('<button class="hide" onClick="hide()"></button>').html('Hide...');

                    let readMore = $('<button class="readMore btn btn-success" onclick="readMore(this)"></button>').attr('id', postId).html('Read More..');
                    let hideText = $('<button class="hide btn btn-success" onClick="hide()"></button>').html('Hide...');

                    var singleAdd = '';


                    if(fullText.length <= 50){
                        singleFullText = $('<p class="short">').html(fullText);

                        singleAdd = [singleAddHeading,singleAddAuthor,singleFullText];


                    }else{
                        shortTxt = add.description.substring(0, 51);
                        singleAddText = $('<p class="short">').html(shortTxt + "...");
                        singleAdd = [singleAddHeading,singleAddAuthor,singleAddText, singleFullText, readMore, hideText];
                    }


                     
                    adds.append(singleAdd);


                    pages[pageIndex].append(adds);
                
            }
            for(var index = 0; index< pages.length; index++){
                $('#AllAdds').append(pages[index]);
                $('#page-selectionAllAdds').append('<button class="btn btn-success" style="margin-top: 10px;" onClick="showPage(' + (index+1) + ')">' + (index+1) + '</button>');
            }

        }
        
    }
     // showPage(pageIndex);
    function showPage(pageIndex){
        $('.page').hide();
        $('#page-'+pageIndex).show();
    }










}










function createAdd() {
    const kinveyAddsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Adds";
    const kinveyAuthHeaders = {
      'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };

    let authorTitle = $('#addTitle').val();

    function validateForm() {
        if(authorTitle.length <= 3){
            showErrorMsg("Title is too short. Minimum 3 characters");
            return false;
        }


        return true;
    }


    if(!validateForm()){
        return;
    }






    let addData = {
        title: $('#addTitle').val(),
        author: currentlyLoggedUser,
        description: $('#addDescription').val(),
        from_date: new Date()

    }

    $.ajax({
        method: "POST",
        url: kinveyAddsUrl,
        headers: kinveyAuthHeaders,
        data: addData,
        success: createAddSuccess,
        error: handleAjaxError
    });
    
    function createAddSuccess(response) {
        showMyAddsView();
        showInfo('Add created.');
    }
}

function modifyAdd() {
    var id = $('#addModifyId').val();
    const kinveyAddsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey+ "/Adds/"+id;
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };

    let addData = {
        title: $('#addModifyTitle').val(),
        author: currentlyLoggedUser,
        description: $('#addModifyDescription').val()
    }

    $.ajax({
        method: "PUT",
        url: kinveyAddsUrl,
        headers: kinveyAuthHeaders,
        data: addData,
        success: modifyAddSuccess,
        error: handleAjaxError
    });

    function modifyAddSuccess(response) {
        showMyAddsView();
        showInfo('Add modified.');
    }
}

function deleteAdd(event) {
    event.preventDefault();

    let confirmation = confirm("Do you really want to delete this post ?");
    if(!confirmation){
        return;
    }

    let id = $(this).attr('data-id');


    const kinveyAddsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Adds";
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };

    $.ajax({
        method: "DELETE",
        url:kinveyAddsUrl + "/" + id,
        headers: kinveyAuthHeaders,
        success: deleteAddSuccess,
        error: handleAjaxError
    });

    function deleteAddSuccess() {
        location.reload();
        showMyAddsView();
    }
}

function editAdd(event) {
    event.preventDefault();
    let id = $(this).attr('data-id');
    const kinveyAddsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Adds/"+id;
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };
    var getData = {'_id': id};
    $.ajax({
        method: "GET",
        url: kinveyAddsUrl,
        headers: kinveyAuthHeaders,
        data: null,
        success: getAddSuccess,
        error: handleAjaxError
    });
    function getAddSuccess(data) {
        $('#addModifyTitle').val(data.title);
        $('#addModifyDescription').val(data.description);
        $('#addModifyId').val(data._id);
        showModifyAddView();
    }
}





