local uci = require("uci")
local js = require("cjson.safe")
local uri = ngx.var.uri
local view = uri:find("/admin/view/")
local call = uri:find("/call/")

local function read(path, func)
	func = func and func or io.open
	local fp = func(path, "rb")
	if not fp then 
		return 
	end 
	local s = fp:read("*a")
	fp:close()
	return s
end

local function verification()
	local curs = uci.cursor()
	local cookie = ngx.req.get_headers()["Cookie"]
	if not cookie then
		return false
	end
	
	local md5psw = cookie:match(".-md5psw=(%w+);?")
	local loginid = cookie:match(".-loginid=(%w+);?")
	if not md5psw or not loginid then
		return false
	end

	local str = read("/tmp/memfile/logintime.json")
	if not str then
		return false
	end
	local map = js.decode(str)
	local times = tonumber(map[loginid]) or 0

	local tt = os.time() - times
	local pwd = curs:get("password", "password", "pwd")
	if not pwd then
		return false
	end

	if ngx.md5(pwd) ~= md5psw or tt > 3600 then
		return false
	end

	return true
end

if view == 1 then
	if not verification() then
		ngx.redirect("/admin/login/admin_login/login.html")
	end
elseif call == 1 then
	if not verification() then
		ngx.say(js.encode({status = 1, data = "login"}))
	end
end
