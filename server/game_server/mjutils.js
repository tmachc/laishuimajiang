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
    else if(id >= 27 && id < 34){
        return 3;
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
    // 计算明牌（碰/杠）的数量
    var mingPaiCount = 0;
    if(seatData.pengs){
        mingPaiCount += seatData.pengs.length;
    }
    if(seatData.angangs){
        mingPaiCount += seatData.angangs.length;
    }
    if(seatData.diangangs){
        mingPaiCount += seatData.diangangs.length;
    }
    if(seatData.wangangs){
        mingPaiCount += seatData.wangangs.length;
    }
    
    // 明牌组成的面子数（每个碰/杠/吃都是1个面子）
    var mingMianziCount = 0;
    if(seatData.pengs){
        mingMianziCount += seatData.pengs.length;
    }
    if(seatData.angangs){
        mingMianziCount += seatData.angangs.length;
    }
    if(seatData.diangangs){
        mingMianziCount += seatData.diangangs.length;
    }
    if(seatData.wangangs){
        mingMianziCount += seatData.wangangs.length;
    }
    if(seatData.chis){
        mingMianziCount += seatData.chis.length / 3;
    }
    
    // 暗牌需要组成的面子数
    var neededMianziCount = 4 - mingMianziCount;
    
    // 创建只包含暗牌的countMap（手牌+胡牌）
    var anCountMap = {};
    for(var k in seatData.countMap){
        anCountMap[k] = seatData.countMap[k];
    }
    // 加入胡的牌
    anCountMap[targetPai] = (anCountMap[targetPai] || 0) + 1;
    
    // 检查暗牌能否组成 neededMianziCount 个面子 + 1个将
    if(!canFormNMianziAnd1Jiang(anCountMap, neededMianziCount)){
        return false;
    }
    
    // 检查胡的牌在暗牌中是否是坎（顺子中间）
    // 并且不能做将/边张/刻子
    var tmpAnSeatData = {
        countMap: anCountMap
    };
    
    // 检查胡的牌是否可以作为将/边张/刻子（在暗牌中）
    if(canBeJiangInAnyPattern(tmpAnSeatData, targetPai, neededMianziCount)){
        return false;
    }
    if(canBeLeftEdgeInAnyPattern(tmpAnSeatData, targetPai, neededMianziCount)){
        return false;
    }
    if(canBeRightEdgeInAnyPattern(tmpAnSeatData, targetPai, neededMianziCount)){
        return false;
    }
    if(canBeKeziInAnyPattern(tmpAnSeatData, targetPai, neededMianziCount)){
        return false;
    }
    
    // 检查胡的牌必须可以作为顺子中间（在暗牌中）
    if(!canBeMiddleInAnyPattern(tmpAnSeatData, targetPai, neededMianziCount)){
        return false;
    }
    
    // 检查胡的牌只能作为唯一一种顺子的中间
    var middleCount = 0;
    // 检查 (targetPai-2, targetPai-1, targetPai) - 作为右边缘
    if(targetPai >= 2 && canBeRightEdgeInAnyPattern(tmpAnSeatData, targetPai, neededMianziCount)){
        middleCount++;
    }
    // 检查 (targetPai-1, targetPai, targetPai+1) - 作为中间
    if(canBeMiddleInAnyPattern(tmpAnSeatData, targetPai, neededMianziCount)){
        middleCount++;
    }
    // 检查 (targetPai, targetPai+1, targetPai+2) - 作为左边缘
    if(targetPai <= 25 && canBeLeftEdgeInAnyPattern(tmpAnSeatData, targetPai, neededMianziCount)){
        middleCount++;
    }
    
    if(middleCount !== 1){
        return false;
    }
    
    // 检查有且只有一种胡法
    var huCount = 0;
    for(var i = 0; i < 27; ++i){
        // 检查暗牌+胡牌i能否组成 neededMianziCount 面子+1将
        var testCountMap = {};
        for(var k in seatData.countMap){
            testCountMap[k] = seatData.countMap[k];
        }
        testCountMap[i] = (testCountMap[i] || 0) + 1;
        if(canFormNMianziAnd1Jiang(testCountMap, neededMianziCount)){
            huCount++;
            if(huCount > 1){
                return false;
            }
        }
    }
    
    if(huCount !== 1){
        return false;
    }
    
    return true;
}

// 检查countMap中的牌能否组成N个面子+1个将
function canFormNMianziAnd1Jiang(countMap, n){
    var totalCount = 0;
    for(var k in countMap){
        totalCount += countMap[k];
    }
    
    // N个面子+1个将 = 3*N + 2 张牌
    if(totalCount !== 3 * n + 2){
        return false;
    }
    
    // 遍历所有可能的将牌
    for(var jiang in countMap){
        jiang = parseInt(jiang);
        if(countMap[jiang] < 2){
            continue;
        }
        
        var tmpMap = copyMap(countMap);
        tmpMap[jiang] -= 2;
        if(tmpMap[jiang] == 0){
            delete tmpMap[jiang];
        }
        
        // 检查剩下的3*N张牌能否组成N个面子
        if(canFormNMianzi(tmpMap, n)){
            return true;
        }
    }
    
    return false;
}

// 检查countMap中的牌能否组成N个面子
function canFormNMianzi(countMap, n){
    var totalCount = 0;
    for(var k in countMap){
        totalCount += countMap[k];
    }
    
    if(totalCount === 0){
        return n === 0;
    }
    
    if(totalCount !== 3 * n){
        return false;
    }
    
    var firstPai = null;
    for(var k in countMap){
        if(countMap[k] > 0){
            firstPai = parseInt(k);
            break;
        }
    }
    
    if(firstPai == null){
        return n === 0;
    }
    
    var firstCount = countMap[firstPai];
    
    // 尝试刻子
    if(firstCount >= 3){
        var tmpMap = copyMap(countMap);
        tmpMap[firstPai] -= 3;
        if(tmpMap[firstPai] == 0) delete tmpMap[firstPai];
        if(canFormNMianzi(tmpMap, n - 1)){
            return true;
        }
    }
    
    // 尝试顺子
    if(firstPai < 27){
        var v = firstPai % 9;
        if(v <= 6){
            var next1 = firstPai + 1;
            var next2 = firstPai + 2;
            if(next2 < 27){
                var count1 = countMap[next1] || 0;
                var count2 = countMap[next2] || 0;
                if(count1 >= 1 && count2 >= 1){
                    var tmpMap = copyMap(countMap);
                    tmpMap[firstPai]--;
                    tmpMap[next1]--;
                    tmpMap[next2]--;
                    if(tmpMap[firstPai] == 0) delete tmpMap[firstPai];
                    if(tmpMap[next1] == 0) delete tmpMap[next1];
                    if(tmpMap[next2] == 0) delete tmpMap[next2];
                    if(canFormNMianzi(tmpMap, n - 1)){
                        return true;
                    }
                }
            }
        }
    }
    
    return false;
}

// 检查在某种胡牌分解中，targetPai是否可以作为将
// n是暗牌需要组成的面子数
function canBeJiangInAnyPattern(seatData, targetPai, n){
    var tmpCountMap = {};
    for(var k in seatData.countMap){
        tmpCountMap[k] = seatData.countMap[k];
    }
    
    if(tmpCountMap[targetPai] < 2){
        return false;
    }
    
    var tmpMap = copyMap(tmpCountMap);
    tmpMap[targetPai] -= 2;
    if(tmpMap[targetPai] == 0){
        delete tmpMap[targetPai];
    }
    
    // 检查剩下的牌能否组成n个面子
    return canFormNMianzi(tmpMap, n);
}

// 检查在某种胡牌分解中，targetPai是否可以作为左边缘
function canBeLeftEdgeInAnyPattern(seatData, targetPai, n){
    if(targetPai >= 27){
        return false;
    }
    
    var v = targetPai % 9;
    if(v > 6){
        return false;
    }
    
    var next1 = targetPai + 1;
    var next2 = targetPai + 2;
    
    if(!isSameType(targetPai, next1) || !isSameType(targetPai, next2)){
        return false;
    }
    
    var tmpCountMap = {};
    for(var k in seatData.countMap){
        tmpCountMap[k] = seatData.countMap[k];
    }
    
    if((tmpCountMap[targetPai] || 0) < 1 || (tmpCountMap[next1] || 0) < 1 || (tmpCountMap[next2] || 0) < 1){
        return false;
    }
    
    var tmpMap = copyMap(tmpCountMap);
    tmpMap[targetPai]--;
    tmpMap[next1]--;
    tmpMap[next2]--;
    if(tmpMap[targetPai] == 0) delete tmpMap[targetPai];
    if(tmpMap[next1] == 0) delete tmpMap[next1];
    if(tmpMap[next2] == 0) delete tmpMap[next2];
    
    // 检查剩下的牌能否组成n-1个面子+1个将
    return canFormNMianziAnd1Jiang(tmpMap, n - 1);
}

// 检查在某种胡牌分解中，targetPai是否可以作为右边缘
function canBeRightEdgeInAnyPattern(seatData, targetPai, n){
    if(targetPai >= 27){
        return false;
    }
    
    var v = targetPai % 9;
    if(v < 2){
        return false;
    }
    
    var prev1 = targetPai - 1;
    var prev2 = targetPai - 2;
    
    if(!isSameType(targetPai, prev1) || !isSameType(targetPai, prev2)){
        return false;
    }
    
    var tmpCountMap = {};
    for(var k in seatData.countMap){
        tmpCountMap[k] = seatData.countMap[k];
    }
    
    if((tmpCountMap[prev2] || 0) < 1 || (tmpCountMap[prev1] || 0) < 1 || (tmpCountMap[targetPai] || 0) < 1){
        return false;
    }
    
    var tmpMap = copyMap(tmpCountMap);
    tmpMap[prev2]--;
    tmpMap[prev1]--;
    tmpMap[targetPai]--;
    if(tmpMap[prev2] == 0) delete tmpMap[prev2];
    if(tmpMap[prev1] == 0) delete tmpMap[prev1];
    if(tmpMap[targetPai] == 0) delete tmpMap[targetPai];
    
    // 检查剩下的牌能否组成n-1个面子+1个将
    return canFormNMianziAnd1Jiang(tmpMap, n - 1);
}

// 检查在某种胡牌分解中，targetPai是否可以作为刻子
function canBeKeziInAnyPattern(seatData, targetPai, n){
    var tmpCountMap = {};
    for(var k in seatData.countMap){
        tmpCountMap[k] = seatData.countMap[k];
    }
    
    if(tmpCountMap[targetPai] < 3){
        return false;
    }
    
    var tmpMap = copyMap(tmpCountMap);
    tmpMap[targetPai] -= 3;
    if(tmpMap[targetPai] == 0){
        delete tmpMap[targetPai];
    }
    
    // 检查剩下的牌能否组成n-1个面子
    return canFormNMianzi(tmpMap, n - 1);
}

// 检查在某种胡牌分解中，targetPai是否可以作为顺子中间
function canBeMiddleInAnyPattern(seatData, targetPai, n){
    if(targetPai >= 27){
        return false;
    }
    
    var v = targetPai % 9;
    if(v < 1 || v > 7){
        return false;
    }
    
    var prev = targetPai - 1;
    var next = targetPai + 1;
    
    if(!isSameType(targetPai, prev) || !isSameType(targetPai, next)){
        return false;
    }
    
    var tmpCountMap = {};
    for(var k in seatData.countMap){
        tmpCountMap[k] = seatData.countMap[k];
    }
    
    if((tmpCountMap[prev] || 0) < 1 || (tmpCountMap[targetPai] || 0) < 1 || (tmpCountMap[next] || 0) < 1){
        return false;
    }
    
    var tmpMap = copyMap(tmpCountMap);
    tmpMap[prev]--;
    tmpMap[targetPai]--;
    tmpMap[next]--;
    if(tmpMap[prev] == 0) delete tmpMap[prev];
    if(tmpMap[targetPai] == 0) delete tmpMap[targetPai];
    if(tmpMap[next] == 0) delete tmpMap[next];
    
    // 检查剩下的牌能否组成n-1个面子+1个将
    // 因为已经用了1个顺子，还需要n-1个面子+1个将
    return canFormNMianziAnd1Jiang(tmpMap, n - 1);
}

function copyMap(map){
    var newMap = {};
    for(var k in map){
        newMap[k] = map[k];
    }
    return newMap;
}

exports.checkTingPai = checkTingPai;
exports.getMJType = getMJType;
exports.checkKanHu = checkKanHu;
