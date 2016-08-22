$(function(){
	createInitModal();
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
	cgicall("WhiteListGet", function(d) {
		if (d.status == 0 && typeof d.data != "undefined") {
			var arr = dtObjToArray(d.data);
			$("#auth_white").val(arr.join("\n"));
		} else {
			console.log("WhiteListGet error...");
		}
	});
	
	cgicall("WechatWhiteListGet", function(d) {
		if (d.status == 0 && typeof d.data != "undefined") {
			var arr = dtObjToArray(d.data);
			$("#wechat_white").val(arr.join("\n"));
		} else {
			console.log("WechatWhiteListGet error...");
		}
	})
	
	cgicall("MacWhiteListGet", function(d) {
		if (d.status == 0 && typeof d.data != "undefined") {
			var arr = dtObjToArray(d.data);
			$("#mac_white").val(arr.join("\n"));
		} else {
			console.log("MacWhiteListGet error...");
		}
	})

	cgicall("MacBlackListGet", function(d) {
		if (d.status == 0 && typeof d.data != "undefined") {
			var arr = dtObjToArray(d.data);
			$("#mac_black").val(arr.join("\n"));
		} else {
			console.log("MacBlackListGet error...");
		}
	})
}

function initEvents() {
	$('.submit').on('click', saveConf);
	$('.wsubmit').on('click', wsaveConf);
	$('.msubmit').on('click', msaveConf);
	$('.bsubmit').on('click', bsaveConf);
	$('[data-toggle="tooltip"]').tooltip();
}

function saveConf() {
	var val = $("#auth_white").val();
	var arr = val.split("\n");
	var sarr = [];
	for (var i = 0; i < arr.length; i++) {
		if ($.trim(arr[i]).length == 0) continue;
		var s = arr[i].replace(/\s/g,'');
		if (typeof s != "undefined" && s && $.trim(s) != "") {
			sarr.push(s);
		}
	}

	cgicall('WhiteListSet', sarr, function(d) {
		if (d.status == 0) {
			initData();
			createModalTips("保存成功！");
		} else {
			createModalTips("保存失败！");
		}
	});
}

function wsaveConf() {
	var val = $("#wechat_white").val();
	var arr = val.split("\n");
	var sarr = [];
	for (var i = 0; i < arr.length; i++) {
		if ($.trim(arr[i]).length == 0) continue;
		var s = arr[i].replace(/\s/g,'');
		if (typeof s != "undefined" && s && $.trim(s) != "") {
			sarr.push(s);
		}
	}

	cgicall('WechatWhiteListSet', sarr, function(d) {
		if (d.status == 0) {
			initData();
			createModalTips("保存成功！");
		} else {
			createModalTips("保存失败！");
		}
	});
}

function msaveConf() {
	var val = $("#mac_white").val();
	var arr = val.split("\n");
	var sarr = [];
	for (var i = 0; i < arr.length; i++) {		
		if ($.trim(arr[i]).length == 0) continue;
		var s = arr[i].replace(/\s/g,'');
		if (typeof s != "undefined" && s && $.trim(s) != "") {
			var reg_name = /[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}/;
			if (!reg_name.test(s) || (s.length > 17)) {
				createModalTips("mac地址格式不正确！mac地址格式为00:24:21:19:BD:E4");
				return;
			}  else{
			sarr.push(s);
			}
		}
	}

	cgicall('MacWhiteListSet', sarr, function(d) {
		if (d.status == 0) {
			initData();
			createModalTips("保存成功！");
		} else {
			createModalTips("保存失败！");
		}
	});
}

function bsaveConf() {
	var val = $("#mac_black").val();
	var arr = val.split("\n");
	var sarr = [];
	for (var i = 0; i < arr.length; i++) {
		if ($.trim(arr[i]).length == 0) continue;
		var s = arr[i].replace(/\s/g,'');
		if (typeof s != "undefined" && s && $.trim(s) != "") {
			var reg_name = /[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}/;
			if (!reg_name.test(s) || (s.length > 17)) {
				createModalTips("mac地址格式不正确！mac地址格式为00:24:21:19:BD:E4");
				return;
			}  else{
			sarr.push(s);
			}
		}
	}

	cgicall('MacBlackListSet', sarr, function(d) {
		if (d.status == 0) {
			initData();
			createModalTips("保存成功！");
		} else {
			createModalTips("保存失败！");
		}
	});
}
