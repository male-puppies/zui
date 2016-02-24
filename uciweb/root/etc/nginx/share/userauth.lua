local query = require("query")
local js = require("cjson.safe")

local uri = ngx.var.uri
local host, port = "127.0.0.1", 9989
local ip_pattern = "^[0-9]+%.[0-9]+%.[0-9]+%.[0-9]+$"
local mac_pattern = "^[0-9a-f][0-9a-f]:[0-9a-f][0-9a-f]:[0-9a-f][0-9a-f]:[0-9a-f][0-9a-f]:[0-9a-f][0-9a-f]:[0-9a-f][0-9a-f]$"

local function reply_str(str)
	assert(type(str) == "string")
	ngx.say(str)
	return true 
end

local function reply(st, v)
	return reply_str(js.encode({status = st, data = v}))
end

local uri_map = {}
uri_map["/cloudonline"] = function()
	local remote_ip = ngx.var.remote_addr
	local param = {
		cmd = uri, 
		ip = remote_ip,  
	}
	local res, err = query.query(host, port, param)
	local _ = res and reply_str(res) or reply(1, err)
end

uri_map["/cloudlogin"] = function() 
	local remote_ip = ngx.var.remote_addr
	local args = ngx.req.get_uri_args()
	local mac, ip = args.mac, args.ip

	ngx.req.read_body()
	local map = ngx.req.get_post_args()
	local username, password = map.username or map.UserName, map.password or map.Password
	if not (ip and mac and username and password) then 
		return reply(1, "invalid param ")
	end 

	if not (#username > 0 and #username <= 16 and #password >= 4 and #password <= 16) then  
		return reply(1, "invalid param 1")
	end 

	if not (mac:find(mac_pattern) and ip:find(ip_pattern)) then  
		return reply(1, "invalid param 2")
	end 

	if remote_ip ~= ip then 
		return reply(1, "invalid param 3")
	end

	local param = {
		cmd = uri,
		ip = ip,
		mac = mac,
		username = username,
		password = password,
	}

	local res, err = query.query(host, port, param)
	local _ = res and reply_str(res) or reply(1, err)
end

uri_map["/wxlogin2info"] = function() 
	local remote_ip = ngx.var.remote_addr
	local args = ngx.req.get_uri_args()
	local mac, ip = args.mac, args.ip 
	if not (mac and ip) then 
		return reply(1, "invalid param 1")
	end 

	if not (mac:find(mac_pattern) and ip:find(ip_pattern)) then  
		return reply(1, "invalid param 2")
	end 

	if remote_ip ~= ip then 
		return reply(1, "invalid param 3")
	end

	local now = args.now 
	if not now then
		ngx.req.read_body()
		local map = ngx.req.get_post_args()
		now = map.now 
	end 

	if not now then 
		return reply(1, "invalid param 4")
	end

	local param = {
		cmd = uri, 
		ip = ip,  
		mac = mac,
		now = now,
	}
	
	local res, err = query.query(host, port, param)
	local _ = res and reply_str(res) or reply(1, err)
end

uri_map["/weixin2_login"] = function() 
	local remote_ip = ngx.var.remote_addr

	local map = ngx.req.get_uri_args()
	local extend, openid = map.extend, map.openId	
	if not extend then 
		ngx.req.read_body()
		local map = ngx.req.get_post_args()
		extend, openid = map.extend, map.openId	
	end
	
	if not (extend and openid) then 
		ngx.exit(ngx.HTTP_FORBIDDEN)
		return
	end 

	local param = {
		cmd = uri,
		ip = remote_ip,
		extend = extend,
		openid = openid,
	}

	local res, err = query.query(host, port, param)
	local _ = res and reply_str(res) or reply(1, err)
end


uri_map["/authopt"] = function() 
	local remote_ip = ngx.var.remote_addr

	local map = ngx.req.get_uri_args()
	local ip, mac = map.ip, map.mac
	if not (ip and mac and mac:find(mac_pattern) and ip:find(ip_pattern)) then  
		return reply(1, "invalid param 2")
	end 

	if remote_ip ~= ip then 
		return reply(1, "invalid param 3")
	end

	local param = {
		cmd = uri,
		ip = remote_ip,
		mac = mac,
	}

	local res, err = query.query(host, port, param)
	local _ = res and reply_str(res) or reply(1, err) 
end


uri_map["/PhoneNo"] = function() 
	local remote_ip = ngx.var.remote_addr
	local args = ngx.req.get_uri_args()
	local mac, ip = args.mac, args.ip
	if not (ip and mac and mac:find(mac_pattern) and ip:find(ip_pattern)) then  
		return reply(1, "invalid param 2")
	end

	ngx.req.read_body()
	local map = ngx.req.get_post_args()
	local username = map.UserName

	if not (username and #username > 8) then 
		return reply(1, "invalid param phone no")
	end 

	local param = {
		cmd = uri,
		ip = ip,
		mac = mac,
		UserName = username,
	}
	local res, err = query.query(host, port, param)
	local _ = res and reply_str(res) or reply(1, err) 
end

uri_map["/webui/login.html"] = function() 
	local remote_ip = ngx.var.remote_addr
	local args = ngx.req.get_uri_args()
	local mac, ip = args.mac, args.ip
	if not (ip and mac and mac:find(mac_pattern) and ip:find(ip_pattern)) then  
		return reply(1, "invalid param 1 " .. string.format("%s %s ---", ip, mac))
	end

	local param = {
		cmd = uri,
		ip = ip,
		mac = mac, 
	}
	
	query.query(host, port, param)
	local fp, s = io.open("/tmp/www/webui/login.html")
	if fp then 
		s = fp:read("*a")
		fp:close()
	else 
		s = "error"
	end 
	reply_str(s)
end

local func = uri_map[uri]
if not func then
	return reply(1, "invalid uri")
end

return func()
