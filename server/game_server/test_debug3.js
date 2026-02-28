// 继续调试坎胡算法
var mjutils = require('./mjutils');

// 测试用例1：999条（碰）9999万（杠）+ 567筒5788条，自摸6条
var holds = [4, 5, 6, 13, 15, 16, 16]; // 567筒 + 5788条
var pengs = [17, 17, 17]; // 999条碰
var gangs = [26, 26, 26, 26]; // 9999万杠
var targetPai = 14; // 6条

// 创建seatData
var countMap = {};
for (var i = 0; i < holds.length; i++) {
    countMap[holds[i]] = (countMap[holds[i]] || 0) + 1;
}

var seatData = {
    holds: holds,
    countMap: countMap,
    tingMap: {},
    pengs: pengs,
    wangangs: gangs
};

console.log('========== 继续调试 ==========');

// 创建包含所有牌的countMap
var totalCountMap = {};
for(var k in seatData.countMap){
    totalCountMap[k] = seatData.countMap[k];
}
if(seatData.pengs){
    for(var i = 0; i < seatData.pengs.length; ++i){
        var pai = seatData.pengs[i];
        totalCountMap[pai] = (totalCountMap[pai] || 0) + 1;
    }
}
if(seatData.wangangs){
    for(var i = 0; i < seatData.wangangs.length; ++i){
        var pai = seatData.wangangs[i];
        totalCountMap[pai] = (totalCountMap[pai] || 0) + 1;
    }
}
totalCountMap[targetPai] = (totalCountMap[targetPai] || 0) + 1;

console.log('所有牌countMap（含胡牌）:');
for (var k in totalCountMap) {
    var id = parseInt(k);
    var name = '';
    if (id >= 0 && id <= 8) name = (id + 1) + '筒';
    else if (id >= 9 && id <= 17) name = (id - 8) + '条';
    else if (id >= 18 && id <= 26) name = (id - 17) + '万';
    console.log('  ' + name + '(' + k + '): ' + totalCountMap[k] + '张');
}

var tmpSeatData = {
    countMap: totalCountMap
};

// 检查各个条件
console.log('\n检查胡的牌是否可以作为:');

// 检查将
function canBeJiangInAnyPattern(seatData, targetPai){
    var tmpCountMap = {};
    for(var k in seatData.countMap){
        tmpCountMap[k] = seatData.countMap[k];
    }
    
    if(tmpCountMap[targetPai] < 2){
        return false;
    }
    
    var tmpMap = {};
    for(var k in tmpCountMap){
        tmpMap[k] = tmpCountMap[k];
    }
    tmpMap[targetPai] -= 2;
    if(tmpMap[targetPai] == 0){
        delete tmpMap[targetPai];
    }
    
    return canAllBeMianzi(tmpMap);
}

// 检查左边缘
function canBeLeftEdgeInAnyPattern(seatData, targetPai){
    if(targetPai >= 27) return false;
    var v = targetPai % 9;
    if(v > 6) return false;
    
    var next1 = targetPai + 1;
    var next2 = targetPai + 2;
    
    var tmpCountMap = {};
    for(var k in seatData.countMap){
        tmpCountMap[k] = seatData.countMap[k];
    }
    
    if((tmpCountMap[targetPai] || 0) < 1 || (tmpCountMap[next1] || 0) < 1 || (tmpCountMap[next2] || 0) < 1){
        return false;
    }
    
    var tmpMap = {};
    for(var k in tmpCountMap){
        tmpMap[k] = tmpCountMap[k];
    }
    tmpMap[targetPai]--;
    tmpMap[next1]--;
    tmpMap[next2]--;
    if(tmpMap[targetPai] == 0) delete tmpMap[targetPai];
    if(tmpMap[next1] == 0) delete tmpMap[next1];
    if(tmpMap[next2] == 0) delete tmpMap[next2];
    
    return canAllBeMianzi(tmpMap);
}

// 检查右边缘
function canBeRightEdgeInAnyPattern(seatData, targetPai){
    if(targetPai >= 27) return false;
    var v = targetPai % 9;
    if(v < 2) return false;
    
    var prev1 = targetPai - 1;
    var prev2 = targetPai - 2;
    
    var tmpCountMap = {};
    for(var k in seatData.countMap){
        tmpCountMap[k] = seatData.countMap[k];
    }
    
    if((tmpCountMap[prev2] || 0) < 1 || (tmpCountMap[prev1] || 0) < 1 || (tmpCountMap[targetPai] || 0) < 1){
        return false;
    }
    
    var tmpMap = {};
    for(var k in tmpCountMap){
        tmpMap[k] = tmpCountMap[k];
    }
    tmpMap[prev2]--;
    tmpMap[prev1]--;
    tmpMap[targetPai]--;
    if(tmpMap[prev2] == 0) delete tmpMap[prev2];
    if(tmpMap[prev1] == 0) delete tmpMap[prev1];
    if(tmpMap[targetPai] == 0) delete tmpMap[targetPai];
    
    return canAllBeMianzi(tmpMap);
}

// 检查刻子
function canBeKeziInAnyPattern(seatData, targetPai){
    var tmpCountMap = {};
    for(var k in seatData.countMap){
        tmpCountMap[k] = seatData.countMap[k];
    }
    
    if(tmpCountMap[targetPai] < 3){
        return false;
    }
    
    var tmpMap = {};
    for(var k in tmpCountMap){
        tmpMap[k] = tmpCountMap[k];
    }
    tmpMap[targetPai] -= 3;
    if(tmpMap[targetPai] == 0){
        delete tmpMap[targetPai];
    }
    
    return canAllBeMianzi(tmpMap);
}

// 检查中间
function canBeMiddleInAnyPattern(seatData, targetPai){
    if(targetPai >= 27) return false;
    var v = targetPai % 9;
    if(v < 1 || v > 7) return false;
    
    var prev = targetPai - 1;
    var next = targetPai + 1;
    
    var tmpCountMap = {};
    for(var k in seatData.countMap){
        tmpCountMap[k] = seatData.countMap[k];
    }
    
    if((tmpCountMap[prev] || 0) < 1 || (tmpCountMap[targetPai] || 0) < 1 || (tmpCountMap[next] || 0) < 1){
        return false;
    }
    
    var tmpMap = {};
    for(var k in tmpCountMap){
        tmpMap[k] = tmpCountMap[k];
    }
    tmpMap[prev]--;
    tmpMap[targetPai]--;
    tmpMap[next]--;
    if(tmpMap[prev] == 0) delete tmpMap[prev];
    if(tmpMap[targetPai] == 0) delete tmpMap[targetPai];
    if(tmpMap[next] == 0) delete tmpMap[next];
    
    return canAllBeMianzi(tmpMap);
}

function canAllBeMianzi(countMap){
    var totalCount = 0;
    for(var k in countMap){
        totalCount += countMap[k];
    }
    
    if(totalCount == 0) return true;
    if(totalCount % 3 != 0) return false;
    
    var firstPai = null;
    for(var k in countMap){
        if(countMap[k] > 0){
            firstPai = parseInt(k);
            break;
        }
    }
    
    if(firstPai == null) return true;
    
    var firstCount = countMap[firstPai];
    
    if(firstCount >= 3){
        var tmpMap = {};
        for(var k in countMap){
            tmpMap[k] = countMap[k];
        }
        tmpMap[firstPai] -= 3;
        if(tmpMap[firstPai] == 0) delete tmpMap[firstPai];
        if(canAllBeMianzi(tmpMap)) return true;
    }
    
    if(firstPai < 27){
        var v = firstPai % 9;
        if(v <= 6){
            var next1 = firstPai + 1;
            var next2 = firstPai + 2;
            if(next2 < 27){
                var count1 = countMap[next1] || 0;
                var count2 = countMap[next2] || 0;
                if(count1 >= 1 && count2 >= 1){
                    var tmpMap = {};
                    for(var k in countMap){
                        tmpMap[k] = countMap[k];
                    }
                    tmpMap[firstPai]--;
                    tmpMap[next1]--;
                    tmpMap[next2]--;
                    if(tmpMap[firstPai] == 0) delete tmpMap[firstPai];
                    if(tmpMap[next1] == 0) delete tmpMap[next1];
                    if(tmpMap[next2] == 0) delete tmpMap[next2];
                    if(canAllBeMianzi(tmpMap)) return true;
                }
            }
        }
    }
    
    return false;
}

console.log('将:', canBeJiangInAnyPattern(tmpSeatData, targetPai) ? '可以' : '不可以');
console.log('左边缘:', canBeLeftEdgeInAnyPattern(tmpSeatData, targetPai) ? '可以' : '不可以');
console.log('右边缘:', canBeRightEdgeInAnyPattern(tmpSeatData, targetPai) ? '可以' : '不可以');
console.log('刻子:', canBeKeziInAnyPattern(tmpSeatData, targetPai) ? '可以' : '不可以');
console.log('中间:', canBeMiddleInAnyPattern(tmpSeatData, targetPai) ? '可以' : '不可以');

console.log('\n6条作为中间牌检查:');
console.log('5条数量:', totalCountMap[13] || 0);
console.log('6条数量:', totalCountMap[14] || 0);
console.log('7条数量:', totalCountMap[15] || 0);
