local query = require("query")
local js = require("cjson.safe")

local uri = ngx.var.uri
local host, port = "127.0.0.1", 9989
local ip_pattern = "^[0-9]+%.[0-9]+%.[0-9]+%.[0-9]+$"
local mac_pattern = "^[0-9a-f][0-9a-f]:[0-9a-f][0-9a-f]:[0-9a-f][0-9a-f]:[0-9a-f][0-9a-f]:[0-9a-f][0-9a-f]:[0-9a-f][0-9a-f]$"

local function reply_table(res)
	ngx.say(js.encode(res))
	return true 
end

local function reply(st, v)
	return reply_table({status = st, data = v}) 
end

local uri_map = {}
uri_map["/cloudonline"] = function()
	local remote_ip = ngx.var.remote_addr
	local param = {
		cmd = uri, 
		ip = remote_ip,  
	}
	local res, err = query.query(host, port, param)
	local _ = res and reply_table(res) or reply(1, err)
end

uri_map["/cloudlogin"] = function() 
	local remote_ip = ngx.var.remote_addr
	
	ngx.req.read_body()
	local map = ngx.req.get_post_args()
	local ip, mac, username, password = map.ip, map.mac, map.username, map.password
	if not (ip and mac and username and password) then 
		return reply(1, "invalid param")
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
	local _ = res and reply_table(res) or reply(1, err)
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
	local _ = res and reply_table(res) or reply(1, err)
end

uri_map["/weixin2_login"] = function() 
	local remote_ip = ngx.var.remote_addr

	ngx.req.read_body()
	local map = ngx.req.get_post_args()

	local extend, openid = map.extend, map.openId
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
	local _ = res and reply_table(res) or reply(1, err)
end

local func = uri_map[uri]
if not func then 
	ngx.say('{"status":1, "msg":"invalid uri"}')
	return
end 

return func()
