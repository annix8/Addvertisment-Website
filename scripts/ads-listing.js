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
view functions!
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
    if(currentlyLoggedUser != null){ $('#greetingsHeading').text("Greetings, " + currentlyLoggedUser);}
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

    if(currentlyLoggedUser != null){ $('#greetingsHeading').text("Greetings, " + currentlyLoggedUser);}
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


/*
-----------------------------------------------------------
 */

/*
login, logout and register
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





