define(function() {
    
    var list = {};

    var DataBridgeObj = {};

    DataBridgeObj.set = function(key, value) {
        return _set(key, value);
    }

    DataBridgeObj.get = function(key) {
        return _get(key);
    }

    function _set(key, value) {
        try {
            if(typeof value === "object") {
                value = JSON.stringify(value);
            }
            if(typeof value === "string") {
                list[key] = value;
                return true;
            }
        } catch(e) {
        }
        return false;
    }

    function _get(key) {
        try {
            value = JSON.parse(list[key]);
            return value;
        } catch(e) {
        }
        return false;
    }

    return DataBridgeObj;
});

require(["sf/dataBridge"],function(dataBridge) {
    B.dataBridge = dataBridge;
})
