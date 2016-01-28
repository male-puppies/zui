
var g_post = {
	// "switch": "",
	"accoutn": "",
	"ac_host": "",
	"descr": ""
};

$(function(){
	createInitModal();
	verifyEventsInit();
	initEvents();
	initData();
});

function createInitModal() {
	$("#modal_tips").modal({
		"backdrop": "static",
		"show": false
	});
}

function initData() {
	cgicall('AccountList', function(d) {
		jsonTraversal(d, jsTravSet);
		if (typeof d.state != "undefined" && d.state == 1) {
			$(".connet-account").show().find("p").html(d.host);
		} else {
			$(".connet-account").hide();
		}
	})
}

function initEvents() {
	$('.submit').on('click', saveConf);
}

function saveConf() {
	if (!verification()) return false;
	
	var obj = jsonTraversal(g_post, jsTravGet);
	cgicall('AccountSet', obj, function(d) {
		if (d.status == 0) {
			initData();
			createModalTips("保存成功！");
		} else {
			createModalTips("保存失败！");
		}
	});
}
