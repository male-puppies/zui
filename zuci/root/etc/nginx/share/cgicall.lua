local query = require("query")
local js = require("cjson.safe")
local result

ngx.req.read_body()
local args, err = ngx.req.get_post_args()
if not (args and args.cmd) then
	result = {status = 1, data = string.format("failed to get post args: %s", err)}
	ngx.say(js.encode(result))
	return
end

local cmd = args.cmd 
local smap = js.decode(cmd)
if not (smap and smap.key) then
	result = {status = 1, data = "failed to get post args"}
	ngx.say(js.encode(result))
	return
end

local group, data = smap.group, smap.data
if not group then
	smap.group = "default"
end
if not data then
	smap.data = {}
end

local s, err = query.query("127.0.0.1", 9998, smap)
if not s then
	result = {status = 1, data = string.format("failed to get query: %s", err)}
	ngx.say(js.encode(result))
	return
end
ngx.say(string.format("%s", s))