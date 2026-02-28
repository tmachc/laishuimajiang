// 详细调试坎胡算法
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

console.log('========== 调试信息 ==========');

// 计算明牌面子数
var mingMianziCount = 0;
if(seatData.pengs){
    mingMianziCount += seatData.pengs.length / 3;
}
if(seatData.wangangs){
    mingMianziCount += seatData.wangangs.length / 4;
}
console.log('明面子数:', mingMianziCount);

var neededMianziCount = 4 - mingMianziCount;
console.log('暗牌需要组成的面子数:', neededMianziCount);

// 创建暗牌countMap（手牌+胡牌）
var anCountMap = {};
for(var k in seatData.countMap){
    anCountMap[k] = seatData.countMap[k];
}
anCountMap[targetPai] = (anCountMap[targetPai] || 0) + 1;

console.log('\n暗牌countMap（含胡牌）:');
var total = 0;
for (var k in anCountMap) {
    var id = parseInt(k);
    var name = '';
    if (id >= 0 && id <= 8) name = (id + 1) + '筒';
    else if (id >= 9 && id <= 17) name = (id - 8) + '条';
    else if (id >= 18 && id <= 26) name = (id - 17) + '万';
    console.log('  ' + name + '(' + k + '): ' + anCountMap[k] + '张');
    total += anCountMap[k];
}
console.log('总张数:', total);
console.log('预期张数:', 3 * neededMianziCount + 2);

// 检查能否组成 neededMianziCount 面子+1将
function canFormNMianziAnd1Jiang(countMap, n){
    var totalCount = 0;
    for(var k in countMap){
        totalCount += countMap[k];
    }
    
    console.log('  检查canFormNMianziAnd1Jiang: 总张数=' + totalCount + ', 需要=' + (3*n+2));
    
    if(totalCount !== 3 * n + 2){
        return false;
    }
    
    // 遍历所有可能的将牌
    for(var jiang in countMap){
        jiang = parseInt(jiang);
        if(countMap[jiang] < 2){
            continue;
        }
        
        var tmpMap = {};
        for(var k in countMap){
            tmpMap[k] = countMap[k];
        }
        tmpMap[jiang] -= 2;
        if(tmpMap[jiang] == 0){
            delete tmpMap[jiang];
        }
        
        // 检查剩下的3*N张牌能否组成N个面子
        if(canFormNMianzi(tmpMap, n)){
            console.log('  找到将牌:', jiang);
            return true;
        }
    }
    
    return false;
}

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
        var tmpMap = {};
        for(var k in countMap){
            tmpMap[k] = countMap[k];
        }
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
                    if(canFormNMianzi(tmpMap, n - 1)){
                        return true;
                    }
                }
            }
        }
    }
    
    return false;
}

console.log('\n检查暗牌能否组成' + neededMianziCount + '面子+1将:');
var result = canFormNMianziAnd1Jiang(anCountMap, neededMianziCount);
console.log('结果:', result ? '可以' : '不可以');
