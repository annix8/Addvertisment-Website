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
    $('#errorBox').text("Error: " + errorMsg);
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

/*Here we get the entire collection of advertisments posted by all users and in the loadSuccess function we select those whose
author is the same with the currentlyLoggedUser
 */
function showMyAddsView() {
    $('#myAdds').empty();
    showView('viewMyAdds');

    const kinveyAddsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Adds";

    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };

   $('body').on("click", ".buttonEdit", editAdd);
   $('body').on("click", ".buttonDelete", deleteAdd);

    $.ajax({
        method: "GET",
        url:kinveyAddsUrl,
        headers: kinveyAuthHeaders,
        success: loadAddsSuccess,
        error: handleAjaxError
    });


    function loadAddsSuccess(adds) {
        showInfo('Your personal adds are loaded.');
        if(adds.length == 0)
            $('#myAdds').text('No adds in the database.');



        else{

          var sd=  adds.filter(function(data){return data.author === currentlyLoggedUser});

            if(sd.length ===0){
                $('#myAdds').text('No adds published by you.');
            }

            for(let add of adds){
                if(add.author === currentlyLoggedUser){
                    let adds = $('<div class="singleAdd">');

                    let singleAddHeading = $('<h1>').html(add.title);
                    let singleAddAuthor = $('<p>').html("posted by " + "<span class='helloUsername'>" + add.author + "</span>");
                    
                    let singleAddText = $('<p>').html(add.description);

                    let btn_edit = $('<button class="buttonEdit" data-id="'+add._id+'">').text('Edit');
                    let btn_delete = $('<button class="buttonDelete" data-id="'+add._id+'">').text('Delete');

                    var singleAdd = [singleAddHeading,singleAddAuthor,singleAddText,btn_edit,btn_delete];
                    adds.append(singleAdd);
                    $('#myAdds').append(adds);
                }

            }

        }
    }

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
function listAdds() {
    $('#adds').empty();
    showView('viewAdds');

    const kinveyAddsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Adds";
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
        if(adds.length == 0)
            $('#adds').text('No adds in the database.');


    else{

        for(let add of adds){
            let adds = $('<div class="singleAdd">');

            let singleAddHeading = $('<h1>').text(add.title);
            let singleAddAuthor = $('<p>').text("posted by " + add.author);
            let singleAddText = $('<p>').text(add.description);

            var singleAdd = [singleAddHeading,singleAddAuthor,singleAddText];
            adds.append(singleAdd);
            $('#adds').append(adds);

        }
        }
    }
}



function createAdd() {
    const kinveyAddsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Adds";
    const kinveyAuthHeaders = {
      'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };

    let addData = {
        title: $('#addTitle').val(),
        author: currentlyLoggedUser,
        description: $('#addDescription').val()

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
        listAdds();
        showInfo('Add created.');
    }
}

function deleteAdd(event) {
    event.preventDefault();
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
    }
}

function editAdd() {
    alert('heya');
}





