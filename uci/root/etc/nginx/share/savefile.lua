-- package.path = "/home/yjs/lua/run/conf/resty/?.lua;" .. package.path 
local js = require("cjson.safe")
local upload = require("upload")
local query = require("query")

local chunk_size = 4096
local form, err = upload:new(chunk_size)
form:set_timeout(0) -- 1 sec
local filelen = 0
local filename
local oname
local fp
local osfilepath = "/tmp/"
local i = 0

while true do
	-- local oname = {}
	local typ, res, err = form:read()
	if not typ then
		ngx.say(js.encode({status = 1, data = "failed to read"}))
		return
    end
    if typ == "header" then
        if res[1] ~= "Content-Type" then
            filename = (function(res)
            	local filename = ngx.re.match(res,'(.+)filename="(.+)"(.*)')
            	if filename then
            		return filename[2]
            	end
            end)(res[2])

            if filename then
				local pathname
				for k, v in res[2]:gmatch('(%w+)="(.-)"') do   
					if k == "name" then
						pathname = v .. ".img"
					end
				end
				
				if pathname then
					i = i + 1
					local filepath = osfilepath  .. pathname
					fp = io.open(filepath, "w+")
					if not fp then
						ngx.say(js.encode({status = 1, data = "failed to open fp"}))
						return
					end
				else
					ngx.say(js.encode({status = 1, data = "failed to get filename"}))
				end
            end
        end
    elseif typ == "body" then
        if fp then
            filelen = filelen + tonumber(string.len(res))
            fp:write(res)
        else
        end
    elseif typ == "part_end" then
        if fp then
            fp:close()
            fp = nil
			-- local map = {
				-- group = "default",
				-- key = "UploadBackup",
				-- data = {}
			-- }

            -- local data, err = query.query("127.0.0.1", 9988, map)
			-- if not data then
				-- result = {status = 1, data = string.format("failed to get query: %s", err)}
				-- ngx.say(js.encode(result))
				-- return
			-- end
			ngx.say(js.encode({status = 0, data = ""}))
        end
    elseif typ == "eof" then
        break
    else
    end
end

if i == 0 then
	ngx.say(js.encode({status = 1, data = "please upload at least one fp!"}))
    return
end
