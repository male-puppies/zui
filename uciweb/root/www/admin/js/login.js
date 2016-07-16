
$(function() {
	getCookies();
	createInitModal;
	initEvents();
});

function createInitModal() {
	$("#modal_tips").modal({
		"backdrop": "static",
		"show": false
	});
}

function getCookies() {
	var user = $.cookie("login_user");
	var pwd = $.cookie("login_pwd");
	
	if (typeof user != "undefined") {
		$("#username").val(user);
	}
	if (typeof pwd != "undefined") {
		$(".remember").prop("checked", true);
		$("#password").val(pwd);
	} else if (typeof user != "undefined"){
		$(".remember").prop("checked", false);
	}
}

function initEvents() {
	// $(".submit").on("click", OnSubmit);
}

function OnSubmit() {
	var username = $("#username").val(),
		password = $("#password").val();

	var obj = {
		username: username,
		password: password
	}
	
	var cmd = {
		"key": "Login",
		"data": obj
	}
	$.post(
		"/logincall",
		{
			"cmd": JSON.stringify(cmd)
		},
		function(d) {
			if (d.status == 0 && typeof d.data == "object" && typeof d.data.md5 != "undefined" && typeof d.data.id != "undefined") {
				$.cookie('md5psw', d.data.md5, {path: "/"});
				$.cookie('loginid', d.data.id, {path: "/"});
				if ($(".remember").is(":checked")) {
					$.cookie('login_user', username, {expires: 7, path: "/"});
					$.cookie('login_pwd', password, {expires: 7, path: "/"});
				} else {
					$.cookie('login_user', username, {expires: 7, path: "/"});
					$.cookie('login_pwd', '', {expires: -1, path: "/"});
				}
				
				var href = "/admin/view/admin_status/index.html";
				if (typeof d.data.wizard != "undefined" && d.data.wizard == "true") {
					href = "/admin/view/admin_system/wizard.html";
				}
				window.location.href = href;
			} else {
				createModalTips("登录失败！" + (d.data ? d.data : ""));
			}
		},
		"json"
	)
}
