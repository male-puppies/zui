
var g_post = {
	// "switch": "",
	"shop_name": "",
	"ssid": "",
	"shop_id": "",
	"appid": "",
	"secretkey": ""
};

$(function(){
	createInitModal
	verifyEventsInit();
	initEvent();
	initData();
});

function createInitModal() {
	$("#modal_tips").modal({
		"backdrop": "static",
		"show": false
	});
}

function initData(){
	cgicall('WxShopList', function(d) {
		jsonTraversal(d, jsTravSet);
		if (typeof d.switch != "undefined" && d.switch == "1") {
			$(".account-tips").show();
			$(".form-group input").prop("disabled", true);
		} else {
			$(".account-tips").hide();
			$(".form-group input").prop("disabled", false);
		}
	})
}

function initEvent(){
	$('#btn_submit').on('click', saveConf);
	$('[data-toggle="tooltip"]').tooltip();
}

function saveConf() {
	if (!verification()) return false;
	
	var obj = jsonTraversal(g_post, jsTravGet);
	cgicall('WxShopSet', obj, function(d) {
		if (d.status == 0) {
			initData();
			createModalTips("保存成功！");
		} else {
			createModalTips("保存失败！");
		}
	});
}
