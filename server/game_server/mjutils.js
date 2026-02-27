function getMJType(id){
    if(id >= 0 && id < 9){
        return 0;
    }
    else if(id >= 9 && id < 18){
        return 1;
    }
    else if(id >= 18 && id < 27){
        return 2;
    }
}

function isSameType(pai1, pai2){
    return getMJType(pai1) == getMJType(pai2);
}

function checkTingPai(seatData, begin, end){
    for(var i = begin; i < end; ++i){
        if(seatData.tingMap[i] != null){
            continue;
        }
        
        var canKanHu = checkKanHu(seatData, i);
        if(canKanHu){
            seatData.tingMap[i] = {
                pattern: "kanhu",
                fan: 1
            };
        }
    }
}

function checkKanHu(seatData, targetPai){
    var canBeMiddle = checkCanBeMiddle(seatData, targetPai);
    if(!canBeMiddle){
        return false;
    }
    
    var canBeJiang = checkCanBeJiang(seatData, targetPai);
    if(canBeJiang){
        return false;
    }
    
    var canBeLeftEdge = checkCanBeLeftEdge(seatData, targetPai);
    if(canBeLeftEdge){
        return false;
    }
    
    var canBeRightEdge = checkCanBeRightEdge(seatData, targetPai);
    if(canBeRightEdge){
        return false;
    }
    
    var canBeKezi = checkCanBeKezi(seatData, targetPai);
    if(canBeKezi){
        return false;
    }
    
    return true;
}

function checkCanBeMiddle(seatData, targetPai){
    var v = targetPai % 9;
    if(v < 1 || v > 7){
        return false;
    }
    
    var prev = targetPai - 1;
    var next = targetPai + 1;
    
    if(!isSameType(targetPai, prev) || !isSameType(targetPai, next)){
        return false;
    }
    
    var prevCount = seatData.countMap[prev] || 0;
    var nextCount = seatData.countMap[next] || 0;
    
    return prevCount >= 1 && nextCount >= 1;
}

function checkCanBeJiang(seatData, targetPai){
    var count = seatData.countMap[targetPai] || 0;
    return count >= 1;
}

function checkCanBeLeftEdge(seatData, targetPai){
    var v = targetPai % 9;
    if(v > 6){
        return false;
    }
    
    var next1 = targetPai + 1;
    var next2 = targetPai + 2;
    
    if(!isSameType(targetPai, next1) || !isSameType(targetPai, next2)){
        return false;
    }
    
    var count1 = seatData.countMap[next1] || 0;
    var count2 = seatData.countMap[next2] || 0;
    
    return count1 >= 1 && count2 >= 1;
}

function checkCanBeRightEdge(seatData, targetPai){
    var v = targetPai % 9;
    if(v < 2){
        return false;
    }
    
    var prev1 = targetPai - 1;
    var prev2 = targetPai - 2;
    
    if(!isSameType(targetPai, prev1) || !isSameType(targetPai, prev2)){
        return false;
    }
    
    var count1 = seatData.countMap[prev1] || 0;
    var count2 = seatData.countMap[prev2] || 0;
    
    return count1 >= 1 && count2 >= 1;
}

function checkCanBeKezi(seatData, targetPai){
    var count = seatData.countMap[targetPai] || 0;
    return count >= 2;
}

exports.checkTingPai = checkTingPai;
exports.getMJType = getMJType;
exports.checkKanHu = checkKanHu;
