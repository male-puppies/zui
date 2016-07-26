var g_macaddr = "";
var g_wlanlist;
var oTabAps;
var opr = "add";
var editAllap = true;
$(function() {
	createInitModal();
	oTabAps = createDtAps();
	verifyEventsInit();
	initData();
	initEvents();
});

function createInitModal() {
	$("#modal_step0").modal({
		"backdrop": "static",
		"keyboard": false,
		"show": true
	});
	$("#modal_step1, #modal_step1_1, #modal_step1_2, #modal_step2, #modal_tips, #modal_spin").modal({
		"backdrop": "static",
		"keyboard": false,
		"show": false
	});
}

function createDtAps() {
	return $('#table_effectaps').dataTable({
		"order": [[0, 'asc']],
		"language": {"url": "../../js/black/dataTables.chinese.json"},
		"columns": [
			{
				"data": "apid",
				"render" : function(d, t, f) {
					return '<span value="' + d + '">' + d + (f.ap_des ? ' (' + f.ap_des + ')' : '') + '</span>';
				}
			},
			{ 
				"data": "check",
				"orderable": false,
				"render": function(d, t, f) {
					if (d == "1") {
						return '<input type="checkbox" checked="checked" value="1 0" />';
					} else {
						return '<input type="checkbox" value="1 0" />';
					}
				}
			}
		],
		"rowCallback": dtBindRowSelectEvents,
		"drawCallback": function() {
			this.$('td:eq(1)', {}).each(function(index, element) {
				if ($(element).find('input').is(":checked")) {
					$(element).parent("tr").addClass("row_selected");
				} else {
					$(element).parent("tr").removeClass("row_selected");
				}
			});
			if (editAllap) {
				$('.efaps_all input').prop("checked", true);
				$('.efaps_oth input').prop("checked", false);
			} else {
				$('.efaps_all input').prop("checked", false);
				$('.efaps_oth input').prop("checked", true);
			}
		}
	})
}

function set_wlanListAps(wlan){
	var obj = {
			"SSID": "",
			"ext_wlanid": ""
		}

	if (wlan && typeof wlan == "object") {
		obj.SSID = wlan["SSID"];
		obj.ext_wlanid = wlan["ext_wlanid"];
	}

	cgicall('WLANListAps', obj, function(d) {
		if (d.status == 0) {
			if (opr == "add") {
				editAllap = true;
				dtRrawData(oTabAps, dtObjToArray(d.data));
			} else {
				editAllap = d.data.allap;
				dtRrawData(oTabAps, dtObjToArray(d.data.apid_arr));
			}
			OnEfaps();
			if (!wlan && dtObjToArray(d.data).length == 0) {
				$(".modal-body legend span.error-ap").css("display", "inline-block");
			}
		}
	})
}

function initData() {
	ucicall("GetWanconfig", function(d) {
		if (d.status == 0 && typeof d.data == "object") {
			var data = d.data;
			g_macaddr = setInitMac(data.initmac);
		}
	});
	cgicall("WLANList", function(d) {
		if (d.status == 0 && typeof d.data == "object") {
			g_wlanlist = d.data;
			var str = "";
			for (var k in g_wlanlist) {
				str += "<option value='" + g_wlanlist[k].ext_wlanid + "' data-wlan='" + k + "'>修改SSID(" + k + ")</option>";
			}
			$("#wlan_read").append(str);
		}
	});
	set_wlanListAps();
}

function setInitMac(mac) {
	function madd(a, b) {
		var num = parseInt(a, 16) + parseInt(b);
		var str = num.toString(16);
		if (str.length == 1) {
			return "0" + str;
		} else if (str.length == 2) {
			return str;
		} else if (str.length == 3) {
			return str.substring(1);
		} else {
			return "00";
		}
	}
	
	var reg = /^([0-9a-fA-F]{2}(:)){5}[0-9a-fA-F]{2}$/;
	if (!reg.test(mac)) return "";

	var arr = mac.split(":");
	if (typeof arr[5] == "undefined") return "";
	var qmac = arr[0] + ":" + arr[1] + ":" + arr[2] + ":" + arr[3] + ":" + arr[4] + ":";

	return (qmac + madd(arr[5], 4));
}

function DoStepNext(that) {
	var data = that.attr("data-next");
	var mid = that.closest(".modal").attr("id");
	if (typeof data == "undefined") {
		var name = that.closest(".modal").find(".data-next").attr("name");
		data = $("input[name='" + name + "']:checked").attr("data-next");
	}
	$("#" + mid).modal("hide");
	$("#" + data).modal("show");
}

function getStep1() {
	var key = "SetWanconfig";
	var obj = {};
	var step1_obj = {
		"dhcp": {
		},
		"pppoe": {
			"username": "",
			"password": ""
		},
		"static": {
			"ipaddr": "",
			"netmask": "",
			"gateway": "",
			"dns": ""
		}
	}
	
	var proto = $("input[name='proto']:checked").val();
	var tmp = obj["wan0"] || {};
	tmp["proto"] = proto;
	tmp["ifname"] = "eth0.5";
	if (g_macaddr != "") {
		tmp["macaddr"] = g_macaddr;
	}

	if (proto in step1_obj) {
		for (var k in step1_obj[proto]) {
			if (k == "dns") {
				tmp[k] = $("#" + k).val().replace(/\,/g, " ");
			} else {
				tmp[k] = $("#" + k).val();
			}
		}
		obj["wan0"] = tmp;
	}
	
	var data = {
		"key": key,
		"data": obj
	}

	return data;
}

function getStep2() {
	var apArr = [],
		obj = {},
		sobj = {},
		nodes = oTabAps.api().rows().nodes();
		
	obj.enable = "1";
	obj.band = "all";
	obj.hide = "0";
	obj.SSID = $("#SSID").val();
	obj.encrypt = $("#encrypt").val();
	obj.password = $("#encrypt_password").val();
	
	if ($('.efaps_all input').is(":checked")) {
		apArr = "allap";
	} else {
		for (var i = nodes.length - 1; i >= 0; i--) {
			if ($(nodes[i]).hasClass('row_selected')) {
				apArr.push($(nodes[i]).find("td:eq(0) span").attr("value"));
			}
		};
	}

	obj.apList = apArr;
	
	if ($("#wlan_read").val() == "$add$") {
		key = "WLANAdd";
		sobj = obj;
	} else {
		key = "WLANModify";
		obj.ext_wlanid = $("#wlan_read").val();
		sobj.cmd = "modify";
		sobj.data = obj;
	}
	
	var data = {
		"key": key,
		"data": sobj
	}

	return data;
}
/*
function getStep3() {
	var key = "PolicyAdd";
	var timestamp = Math.round(new Date().getTime()/1000);
	var obj = {
		"name": "default_" + timestamp,
		"ip1": "0.0.0.0",
		"ip2": "255.255.255.255",
		"type": "web"
	}
	var data = {
		"key": key,
		"data": obj
	}
	
	return data;
}

function getStep4() {
	var key = "AccountSet";
	var obj = {
		"switch": "1",
		"account": $("#account").val(),
		"ac_host": $("#ac_host").val(),
		"descr": $("#descr").val(),
		"ac_port": "61886"
	}
	
	var data = {
		"key": key,
		"data": obj
	}
	
	return data;
}
*/
function DoSave() {
	cgistarModal();
	var obj = {
		"step1": getStep1(),
		"step2": getStep2(),
		// "step3": getStep3(),
		// "step4": getStep4(),
		"check_step1": true,
		"check_step2": true,
		// "check_step3": false,
		// "check_step4": false,
		"stip1": "网络配置生效中...",
		"etip1": "生效网络配置失败！请尝试在左侧手动配置！",
		"href1": "/admin/view/admin_network/wanconfig.html",
		"stip2": "无线配置生效中...",
		"etip2": "生效无线配置失败！请尝试在左侧手动配置！",
		"href2": "/admin/view/admin_wireless/wlanconfig.html"
		// "stip3": "认证配置生效中...",
		// "etip3": "生效认证配置失败！请尝试在左侧手动配置！",
		// "href3": "/admin/view/admin_webauth/authpolicy.html",
		// "stip4": "云端配置生效中...",
		// "etip4": "生效云端配置失败！请尝试在左侧手动配置！",
		// "href4": "/admin/view/admin_webauth/account.html"
	}
	
	// if ($("input[name='type']:checked").val() == "web") {
		// obj.check_step3 = true;

		// if ($("input[name='local_account']:checked").val() == "account") {
			// obj.check_step4 = true;
		// }
	// }
	
	!(function docall(i) {
		if (i > 2) {
			cgiendModal();
			return;
		}
		var check = obj["check_step" + i],
			key = obj["step" + i]["key"],
			data = obj["step" + i]["data"];

		if (check) {
			$("#modal_spin .modal-body p").html(obj["stip" + i]);
			if (i == 1) {
				ucicall(key, data, function(d) {
					if (d.status == 0) {
						docall(++i);
					} else {
						cgiendModal(obj["etip" + i], obj["href" + i]);
					}
				});
			} else {
				cgicall(key, data, function(d) {
					if (d.status == 0) {
						docall(++i);
					} else {
						cgiendModal(obj["etip" + i], obj["href" + i]);
					}
				});
			}
		} else {
			cgiendModal();
		}
	})(1);
}

function cgistarModal() {
	$(".modal.in").modal("hide");
	$("#modal_spin").modal("show");
}

function cgiendModal(tip, href) {
	$(".modal.in").modal("hide");
	if (!tip) {
		tip = "配置成功！";
	}
	if (!href) {
		href = "/admin/view/admin_status/index.html";
	}

	$("#modal_tips .modal-p span").html(tip);
	$("#modal_tips .modal_done").attr("onclick", "javascript:window.location.href='" + href + "';");
	$("#modal_tips").modal("show");
}

function initEvents() {
	$("#modal_step0").on("shown.bs.modal", function() { $("#modal_step0").removeClass("fade"); });
	$(".close-wizard").on("click", function() { window.location.href = "/admin/view/admin_status/index.html"; });
	$(".prev-step").on("click", OnStepPrev);
	$(".next-step").on("click", OnStepNext);
	$(".checkall2").on("click", OnSelectAll2);
	$('[name="efaps"]').on("change", OnEfaps);
	$("#wlan_read").on("change", OnWlanRead);
	$("#encrypt").on("change", OnEncrypt);
	$(".showlock").on("click", OnShowlock);
	$('[data-toggle="tooltip"]').tooltip();
	OnAdd();
	
	// $("#modal_step3, #modal_step4").on("show.bs.modal", function() { OnDoneSave(this, true) });
	// $("input[name='type'], input[name='local_account']").on("click", function() { OnDoneSave(this) });
}

function OnStepPrev() {
	var data = $(this).attr("data-prev");
	var mid = $(this).closest(".modal").attr("id");
	$("#" + mid).modal("hide");
	$("#" + data).modal("show");
}

function OnStepNext() {
	var that = $(this),
		done = that.attr("data-done"),
		id = that.closest(".modal").attr("id");
		
	if (!verification("#" + id)) return;
	
	if (id == "modal_step2") {
		var option_val = that.val(),
			ssid_val = $("#SSID").val(),
			wlan = $("#wlan_read").find("option:selected").attr("data-wlan");

		for (var k in g_wlanlist) {
			if (ssid_val == k && (option_val == "$add$" || ssid_val != wlan)) {
				$("#SSID").closest(".form-group").addClass("has-error");
				$("#modal_step2 .modal-footer .tip").html("该SSID已存在，请更换配置方式或重命名SSID。");
				return;
			}
		}
	}
	
	if (typeof done != "undefined") {
		var arr = done.split("|");
		if (arr[0] == "done" || (arr[0] == "check" && typeof arr[1] != "undefined" && $("input[name='" + arr[1] + "']:checked").attr("data-done") == "done")) {
			DoSave();
		} else {
			DoStepNext(that);
		}
	} else {
		DoStepNext(that);
	}
}

function OnSelectAll2() {
	dtSelectAll(this, oTabAps);
}

function OnEfaps() {
	var checked = $("input[name='efaps']:checked").val();
	if (checked == "all") {
		$(".effectaps").slideUp();
	} else {
		$(".effectaps").slideDown();
	}
}

function OnWlanRead() {
	var val = $(this).val();
	if (val == "$add$") {
		OnAdd();
		set_wlanListAps();
	} else {
		opr = "edit";
		var wlan = $(this).find("option:selected").attr("data-wlan");
		var obj;
		if (typeof g_wlanlist[wlan] != "undefined") {
			obj = g_wlanlist[wlan]
		}
		$("#SSID").val(obj.SSID);
		$("#encrypt").val(obj.encrypt);
		$("#encrypt_password").val(obj.password);
		OnEncrypt();
		set_wlanListAps(obj);
	}
}

function OnEncrypt() {
	var ent = $('#encrypt').val();
	if (ent == 'none') {
		$('#encrypt_password').prop('disabled', true);
		$('#encrypt_password').val('');
	}else{
		$('#encrypt_password').prop('disabled', false);
	};
}

function OnAdd() {
	opr = "add";
	editAllap = true;
	$("#encrypt").val("none");
	$('#encrypt_password').prop('disabled', true);
	$('#encrypt_password').val('');
	$("#SSID").val("");
	OnEncrypt();
}

function OnShowlock() {
	var tt = $(this).closest(".form-group").find("input.form-control")
	if (tt.length > 0 && (tt.attr("type") == "text" || tt.attr("type") == "password")) {
		if (tt.attr("type") == "password") {
			$(this).find("i").removeClass("icon-lock").addClass("icon-unlock");
			tt.attr("type", "text");
		} else {
			$(this).find("i").removeClass("icon-unlock").addClass("icon-lock");
			tt.attr("type", "password")
		}
	}
}

/*
function OnDoneSave(t, f) {
	var that;
	if (f) {
		that = $(t);
	} else {
		var id = $(t).closest(".modal").attr("id");
		that = $("#" + id);
	}

	var next_step = that.find(".next-step");
	var done = next_step.attr("data-done");
	if (typeof done != "undefined") {
		var arr = done.split("|");
		if (arr[0] == "done" || (arr[0] == "check" && typeof arr[1] != "undefined" && $("input[name='" + arr[1] + "']:checked").attr("data-done") == "done")) {
			next_step.html("完　成");
		} else {
			next_step.html("下一步");
		}
	} else {
		next_step.html("下一步");
	}
}
*/