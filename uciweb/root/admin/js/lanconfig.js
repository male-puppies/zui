var g_getvalue = {
	"ipaddr": "",
	"netmask": ""
}

$(function() {
	createInitModal();
	verifyEventsInit();
	initEvents();
	initData();
});

function createInitModal() {
	$("#modal_tips, #modal_spin").modal({
		"backdrop": "static",
		"show": false
	});
}

function initData() {
	ucicall("GetLanconfig", function(d) {
		if (d.status == 0 && typeof d.data == "object") {
			var data = d.data;
			jsonTraversal(data, jsTravSet);
			setLan(data);
		}
	})
}

function setLan(data) {
	if (typeof data == "object") {
		for (var i = 1; i < 4; i++) {
			var lan = "lan" + i;
			if (lan in data) {
				$("." + lan + " .enable").prop("checked", true);
				OnEnable();
			} else {
				$("." + lan + " .enable").prop("checked", false);
				OnEnable();
			}
		}

		var num = parseInt(data.wan.length) || 1
		if (num > 1 && num < 5) {
			$(".enable").prop("disabled", false);
			for (var k = 5 - num; k < 4; k++) {
				$(".lan" + k + " .title b").html("该口已被WAN占用");
				$(".lan" + k + " .enable").prop("disabled", true);
			}
		}
	}
}

function initEvents() {
	$(".submit").on("click", OnSubmit)
	$(".wrapper-oth").hide();
	$(".main-wrapper.other > .main-top").on("click", OnSHide);
	$("#lan1__enable, #lan2__enable, #lan3__enable").on("click", function() { OnEnable(this); });
	OnEnable();
}

function OnSubmit() {
	if (!verification()) return;
	var sameip = [];
	for (var i = 0; i < 4; i++) {
		if (!($("#lan" + i + "__ipaddr").is(":disabled"))) {
			sameip.push($("#lan" + i + "__ipaddr").val())
		}
	}
	if (/(\x0f[^\x0f]+)\x0f[\s\S]*\1/.test("\x0f" + sameip.join("\x0f\x0f") + "\x0f")) {
		createModalTips("IP地址不能相同！");
		return;
	}

	var obj = {};
	obj["lan0"] = {
		"ifname": 'eth0.1',
		"proto": "static",
		"ipaddr": $("#lan0__ipaddr").val(),
		"netmask": $("#lan0__netmask").val()
	}
	for (var i = 1; i < 4; i++) {
		var query = $("#lan" + i + "__enable")
		if (!(query.is(":disabled")) && query.is(":checked")) {
			var tmp = obj["lan" + i] || {}
			tmp["ifname"] = "eth0." + (i+1);
			tmp["proto"] = "static";
			for (var k in g_getvalue) {
				tmp[k] = $("#lan" + i + "__" + k).val();
			}
			obj["lan" + i] = tmp;
		}
	}

	$("#modal_spin").modal("show");
	ucicall("SetLanconfig", obj, function(d) {
		var func = {
			"sfunc": function() {
				initData();
				createModalTips("保存成功！");
			},
			"ffunc": function() {
				createModalTips("保存失败！" + (d.data ? d.data : ""));
			}
		}
		cgicallBack(d, "#modal_spin", func);
	});
}

function OnSHide() {
	if ($(".wrapper-oth").is(":hidden")) {
		$(".other .icon-double-angle-down").removeClass("icon-double-angle-down").addClass("icon-double-angle-up");
		$(".wrapper-oth").slideDown(500);
	} else {
		$(".other .icon-double-angle-up").removeClass("icon-double-angle-up").addClass("icon-double-angle-down");
		$(".wrapper-oth").slideUp(500);
	}
}

function OnEnable(that) {
	if (typeof that != "undefined") {
		checked(that)
	} else {
		$("#lan1__enable, #lan2__enable, #lan3__enable").each(function(index, element) {
			checked(element);
		});
	}
	
	function checked(_that) {
		if ($(_that).is(":checked") && !($(_that).is(":disabled"))) {
			$(_that).parents("form.form-horizontal").find("input[type='text']").prop("disabled", false);
		} else {
			$(_that).parents("form.form-horizontal").find("input[type='text']").prop("disabled", true);
		}
	}
}