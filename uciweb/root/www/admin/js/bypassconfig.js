// var g_getvalue = {
	// "ipaddr": "",
	// "netmask": ""
// }
// var g_getdhcp = {
	// "start": "",
	// "limit": "",
	// "leasetime": "",
	// "dhcp_option": "",
// }

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
	ucicall("GetBypassconfig", function(d) {
		if (d.status == 0 && typeof d.data == "object") {
			var data = {};
			for (var k in d.data) {
				if (k.substring(0, 1) == ".") continue;
				if (k == "dns") {
					data["dns"] = d.data["dns"].replace(/\ /g, ",");
					continue;
				}
				data[k] = d.data[k];
			}
			jsonTraversal(data, jsTravSet);
		} else {
			createModalTips("初始化失败！请尝试重新加载！");
		}
	})
}

function initEvents() {
	$(".submit").on("click", OnSubmit)
	$('[data-toggle="tooltip"]').tooltip();
}

function OnSubmit() {
	if (!verification()) return;
	
	var obj = {
		"ipaddr": "",
		"netmask": "",
		"gateway": "",
		"dns": ""
	}
	var o = jsonTraversal(obj, jsTravGet);
	o.dns = o["dns"].replace(/\,/g, " ");
	o.ifname = "eth0";
	o.proto = "static";

	$("#modal_spin").modal("show");
	ucicall("SetBypassconfig", o, function(d) {
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
