// 坎胡测试脚本 - 调试版2
var mjutils = require('./mjutils');

function createSeatData(holds) {
    var countMap = {};
    for (var i = 0; i < holds.length; i++) {
        var pai = holds[i];
        countMap[pai] = (countMap[pai] || 0) + 1;
    }
    return {
        holds: holds,
        countMap: countMap,
        tingMap: {}
    };
}

function parseHand(handStr) {
    var holds = [];
    var parts = handStr.split('，');
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i].trim();
        if (part.indexOf('筒') >= 0) {
            var nums = part.replace('筒', '');
            for (var j = 0; j < nums.length; j++) {
                holds.push(parseInt(nums[j]) - 1);
            }
        } else if (part.indexOf('条') >= 0) {
            var nums = part.replace('条', '');
            for (var j = 0; j < nums.length; j++) {
                holds.push(parseInt(nums[j]) - 1 + 9);
            }
        } else if (part.indexOf('万') >= 0) {
            var nums = part.replace('万', '');
            for (var j = 0; j < nums.length; j++) {
                holds.push(parseInt(nums[j]) - 1 + 18);
            }
        }
    }
    return holds;
}

function getPaiName(id) {
    if (id >= 0 && id <= 8) return (id + 1) + '筒';
    if (id >= 9 && id <= 17) return (id - 8) + '条';
    if (id >= 18 && id <= 26) return (id - 17) + '万';
    return '?';
}

// 检查能胡哪些牌
function checkAllHu(seatData) {
    var huPaiList = [];
    for (var i = 0; i < 27; i++) {
        // 使用canHuWithStandardPattern的副本逻辑
        var tmpCountMap = {};
        for (var k in seatData.countMap) {
            tmpCountMap[k] = seatData.countMap[k];
        }
        tmpCountMap[i] = (tmpCountMap[i] || 0) + 1;
        
        // 检查标准胡牌结构
        var canHu = false;
        for (var jiang in tmpCountMap) {
            jiang = parseInt(jiang);
            var jiangCount = tmpCountMap[jiang];
            if (jiangCount < 2) continue;
            
            var tmpMap = {};
            for (var k in tmpCountMap) {
                tmpMap[k] = tmpCountMap[k];
            }
            tmpMap[jiang] -= 2;
            if (tmpMap[jiang] == 0) delete tmpMap[jiang];
            
            if (canAllBeMianzi(tmpMap)) {
                canHu = true;
                break;
            }
        }
        
        if (canHu) {
            huPaiList.push(getPaiName(i));
        }
    }
    return huPaiList;
}

function copyMap(map) {
    var newMap = {};
    for (var k in map) {
        newMap[k] = map[k];
    }
    return newMap;
}

function canAllBeMianzi(countMap) {
    var totalCount = 0;
    for (var k in countMap) {
        totalCount += countMap[k];
    }
    if (totalCount == 0) return true;
    
    var firstPai = null;
    for (var k in countMap) {
        if (countMap[k] > 0) {
            firstPai = parseInt(k);
            break;
        }
    }
    if (firstPai == null) return true;
    
    var firstCount = countMap[firstPai];
    
    // 尝试刻子
    if (firstCount >= 3) {
        var tmpMap = copyMap(countMap);
        tmpMap[firstPai] -= 3;
        if (tmpMap[firstPai] == 0) delete tmpMap[firstPai];
        if (canAllBeMianzi(tmpMap)) return true;
    }
    
    // 尝试顺子
    if (firstPai < 27) {
        var v = firstPai % 9;
        if (v <= 6) {
            var next1 = firstPai + 1;
            var next2 = firstPai + 2;
            if (next2 < 27) {
                var count1 = countMap[next1] || 0;
                var count2 = countMap[next2] || 0;
                if (count1 >= 1 && count2 >= 1) {
                    var tmpMap = copyMap(countMap);
                    tmpMap[firstPai]--;
                    tmpMap[next1]--;
                    tmpMap[next2]--;
                    if (tmpMap[firstPai] == 0) delete tmpMap[firstPai];
                    if (tmpMap[next1] == 0) delete tmpMap[next1];
                    if (tmpMap[next2] == 0) delete tmpMap[next2];
                    if (canAllBeMianzi(tmpMap)) return true;
                }
            }
        }
    }
    
    return false;
}

// 调试测试1
console.log('========== 调试测试1 ==========');
var hand1 = parseHand('123456789筒，13筒，22万');
var seatData1 = createSeatData(hand1);
console.log('手牌:', hand1.map(getPaiName));
var huList1 = checkAllHu(seatData1);
console.log('能胡的牌:', huList1);
console.log('能胡的数量:', huList1.length);

// 调试测试3
console.log('\n========== 调试测试3 ==========');
var hand3 = parseHand('12335678筒，12344万');
var seatData3 = createSeatData(hand3);
console.log('手牌:', hand3.map(getPaiName));
var huList3 = checkAllHu(seatData3);
console.log('能胡的牌:', huList3);
console.log('能胡的数量:', huList3.length);

// 调试测试5
console.log('\n========== 调试测试5 ==========');
var hand5 = parseHand('11113456789筒，11万');
var seatData5 = createSeatData(hand5);
console.log('手牌:', hand5.map(getPaiName));
var huList5 = checkAllHu(seatData5);
console.log('能胡的牌:', huList5);
console.log('能胡的数量:', huList5.length);
