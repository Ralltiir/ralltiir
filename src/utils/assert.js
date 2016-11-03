define(function() {
    function assert(predict, msg){
        if(!predict){
            throw new Error(msg);
        }
    }
    return assert;
});

