var lanconfig;
var g_getvalue = {
	"leasetime": "",
	"start": "",
	"limit": "",
	"dhcp_option": ""
};

$(function() {
	verifyEventsInit();
	initEvents();
	initData();
});

function initEvents() {
	$(".submit").on("click", OnSubmit);
	$("#lan0__enable, #lan1__enable, #lan2__enable, #lan3__enable").on("click", function() { OnEnable(this); });
	OnEnable();
	$('[data-toggle="tooltip"]').tooltip();
}

function createInitModal() {
	$("#modal_tips, #modal_spin").modal({
		"backdrop": "static",
		"show": false
	});
}

function initData() {
	ucicall("GetLanconfig", function(d) {
		if (d.status == 0 && typeof d.data == "object") {
			lanconfig = d.data;
			for (var i = 0; i < 4; i++) {
				var lan = "lan" + i;
				if (lan in lanconfig) {
					$("." + lan).show();
					$("." + lan + " .enable").prop("disabled", false);
					// OnEnable();
				} else {
					$("." + lan).hide();
					$("." + lan + " .enable").prop("checked", false).prop("disabled", true);
					// OnEnable();
				}
			}
			
			ucicall("GetDhcpconfig", function(data) {
				if (data.status == 0 && typeof data.data == "object") {
					var con = data.data;
					for (var k in con) {
						var dhcp_option = con[k]["dhcp_option"];
						if (typeof dhcp_option != "undefined" && dhcp_option.substring(0, 2) == "6,") {
							con[k]["dhcp_option"] = dhcp_option.substring(2, dhcp_option.length);
						}
						
						var leasetime = con[k]["leasetime"];
						if (typeof leasetime != "undefined" && leasetime.substring(leasetime.length-1, leasetime.length) == "h") {
							con[k]["leasetime"] = leasetime.substring(0, leasetime.length - 1);
						}
						
						if (typeof con[k]["ignore"] != "undefined" && con[k]["ignore"] == "1") {
							$("#" + k + "__enable").prop("checked", false);
							OnEnable("#" + k + "__enable");
						} else {
							$("#" + k + "__enable").prop("checked", true);
							OnEnable("#" + k + "__enable");
						}
						
						var netmask = lanconfig[k].netmask;
						var ipaddr = lanconfig[k].ipaddr;
						var start = con[k].start;
						var limit = con[k].limit;
						if (typeof netmask == "undefined" || typeof ipaddr == "undefined" || typeof start == "undefined" || typeof limit == "undefined") continue;
						
						var ips = intToip(maskip(netmask, ipaddr) + Number(start)) + "-" + intToip(maskip(netmask, ipaddr) + Number(start) + Number(limit));

						$("#" + k + "__ipaddrs").val(ips);
					}
					
					jsonTraversal(con, jsTravSet);
				} else {
					createModalTips("初始化失败！请尝试重新加载！");
				}
			});
		} else {
			createModalTips("初始化失败！请尝试重新加载！");
		}
	})
}

function OnSubmit() {
	if (!verification()) return;

	var obj = {};
	for (var i = 0; i < 4; i++) {
		var query = $("#lan" + i + "__enable");
		var config = lanconfig["lan" + i];
		if (typeof config == "undefined") continue;
		var netmask = config.netmask;
		var ipaddr = config.ipaddr;
		
		if (typeof netmask == "undefined" || typeof ipaddr == "undefined") {
			createModalTips("初始化失败！请尝试重新加载！");
			return;
		}
		
		if (!(query.is(":disabled"))) {
			var tmp = obj["lan" + i] || {};
			tmp["interface"] = "lan" + i;

			if (query.is(":checked")) {
				for (var k in g_getvalue) {
					var value = $("#lan" + i + "__" + k).val();
					if (typeof value != "undefined" && value != "") {
						if (k == "dhcp_option") {
							tmp[k] = "6," + $("#lan" + i + "__" + k).val();
						} else if (k == "leasetime") {
							tmp[k] = $("#lan" + i + "__" + k).val() + "h";
						} else {
							tmp[k] = $("#lan" + i + "__" + k).val();
						}
					}
				}
				var ips = $("#lan" + i + "__ipaddrs").val().split("-");
				if (ips.length != 2) return;
				tmp["start"] = ipToint(intToip(ipToint(ips[0]) - maskip(netmask, ipaddr))) + "";
				tmp["limit"] = ipToint(intToip(ipToint(ips[1]) - maskip(netmask, ipaddr))) - tmp["start"] + "";
			} else {
				tmp["ignore"] = "" + 1;
			}

			obj["lan" + i] = tmp;
		}
	}

	$("#modal_spin").modal("show");
	ucicall("SetDhcpconfig", obj, function(d) {
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

function OnEnable(that) {
	if (typeof that != "undefined") {
		checked(that)
	} else {
		$("#lan0__enable, #lan1__enable, #lan2__enable, #lan3__enable").each(function(index, element) {
			checked(element);
		});
	}
	
	function checked(_that) {
		if ($(_that).is(":checked")) {
			$(_that).parents("form.form-horizontal").find("input[type='text']").prop("disabled", false);
		} else {
			$(_that).parents("form.form-horizontal").find("input[type='text']").prop("disabled", true);
		}
	}
}

function maskip(mask, ip) {
	console.log(mask)
	console.log(ip)
	var masknum = ipToint(mask);
	var ipnum = ipToint(ip);
	return (masknum & ipnum);
}

function ipToint(ip) {
	var num = 0;
    ip = ip.split(".");
    num = Number(ip[0]) * 256 * 256 * 256 + Number(ip[1]) * 256 * 256 + Number(ip[2]) * 256 + Number(ip[3]);
    num = num >>> 0;
    return num;
}

function intToip(num) {
	var str;
    var tt = [];
    tt[0] = (num >>> 24) >>> 0;
    tt[1] = ((num << 8) >>> 24) >>> 0;
    tt[2] = (num << 16) >>> 24;
    tt[3] = (num << 24) >>> 24;
    str = String(tt[0]) + "." + String(tt[1]) + "." + String(tt[2]) + "." + String(tt[3]);
    return str;
}
