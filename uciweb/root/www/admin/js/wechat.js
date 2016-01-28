
var g_post = {
	"shop_name": "",
	"ssid": "",
	"shop_id": "",
	"appid": "",
	"secretkey": ""
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
	cgicall('WxShopList', function(d) {
		if (d.status == 0) {
			jsonTraversal(d.data, jsTravSet);
			if (typeof d.data.switch != "undefined" && d.data.switch == "1") {
				$(".account-tips").show();
				$(".form-group input").prop("disabled", true);
			} else {
				$(".account-tips").hide();
				$(".form-group input").prop("disabled", false);
			}
		}
	})
}

function initEvents() {
	$('.submit').on('click', saveConf);
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
