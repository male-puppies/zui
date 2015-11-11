$(function() {
	createInitModal();
	oTabAPs = createDtAps();
	initEventing();
	$('[data-toggle="tooltip"]').tooltip();
});

function createDtAps() {
	$('#table_apstaus').dataTable({
		"pagingType": "full_numbers",
		"language": {"url": '/luci-static/resources/js/black/dataTables.chinese.json'},
		"ajax": {
			"url": "../../js/apstatus.json",
			"dataSrc": function(json) {
				return json.data.APs
			}
		},
		"columns": [
			{
				"data": null,
				"sWidth": 60
			},
            {
				"data": "mac"
			},
			{
				"data": "ap_describe"
			},
            {
				"data": "ip_address"
			},
			{
				"data": "current_users",
				"render": function(d, t, f) {
					return '<a class="underline" href="onlineuser?filter='+ f.mac +'">' + d + '</a>';
				}
			},
            {
				"data": "radio",
				"render": function(d, t, f) {
					return '<a class="underline" href="radiostatus?filter='+ f.mac +'">' + d.toUpperCase() + '</a>';
				}
			},
			{
				"data": "naps",
				"render": function(d, t, f) {
					return '<a href="#"><span class="badge">' + d.length + '</span></a>'
					//return '<a href="javascript:;" onclick="openNaps(\'' + f.mac + '\')">23</a>';
				}
			},
            {
				"data": "boot_time"
			},
			{
				"data": "online_time"
			},
            {
				"data": "firmware_ver",
				"render": function(d, t, f) {
					var str = d;
					var aVer = d.split('.');
					if (aVer && aVer.length > 4) {
						str = aVer[0] + '.' + aVer[4];
					};
					return str;
				}
			},
			{
				"data": "state",
				"render": function(d, t, f) { //状态,online,offline
					var str = '<span style="color:';
					if (d.status == '1') {
						str += 'green;">在线';
					} else if (d.status == '2'){
						str += 'blue;">升级中';
					} else {
						str += 'grey;">离线';
					}
					str += "</span>"
					return str;
				}
			},
			{
				"data": null,
				"width": 90,
				"orderable": false,
				"render": function(d, t, f) {
					if (f.state.status == "0") {
						return '<div class="btn-group btn-group-xs"><a class="btn btn-zx"><i class="icon-pencil"></i></a><a class="btn btn-danger"><i class="icon-trash"></i></a></div>';
					} else {
						return '<div class="btn-group btn-group-xs"><a class="btn btn-zx"><i class="icon-pencil"></i></a><a class="btn btn-danger disabled"><i class="icon-trash"></i></a></div>';
					}
				}
			},
			{
				"data": null,
				"width": 60,
				"orderable": false,
				"searchable": false,
				"defaultContent": '<input type="checkbox" value="1 0" />'
				//"render": function(d, t, f) {}
			}
        ],
		"drawCallback": function() {
			this.api().column(0).nodes().each(function(cell, i) {
				cell.innerHTML = i + 1;
			});
		}
	});
}

function createInitModal() {
	$('#modal_edit').modal({
		"backdrop": "static",
		"show": false
	})
}

function initEventing() {
	$(".edit").on("click", function() {
		$('#modal_edit').modal("show")
	})
}









