// 调试 canBeMiddleInAnyPattern
console.log('========== 调试 canBeMiddleInAnyPattern ==========');

// 暗牌countMap（含胡牌）
var anCountMap = {
    '4': 1,  // 5筒
    '5': 1,  // 6筒
    '6': 1,  // 7筒
    '13': 1, // 5条
    '14': 1, // 6条（胡的牌）
    '15': 1, // 7条
    '16': 2  // 8条
};

var neededMianziCount = 2;
var targetPai = 14; // 6条

console.log('暗牌countMap:');
for (var k in anCountMap) {
    console.log('  ' + k + ': ' + anCountMap[k]);
}
console.log('需要组成的面子数:', neededMianziCount);
console.log('targetPai:', targetPai);

// 检查6条作为中间牌
var prev = targetPai - 1; // 5条 = 13
var next = targetPai + 1; // 7条 = 15

console.log('\n检查6条作为(5-6-7)中间:');
console.log('prev (5条):', anCountMap[prev] || 0);
console.log('target (6条):', anCountMap[targetPai] || 0);
console.log('next (7条):', anCountMap[next] || 0);

if ((anCountMap[prev] || 0) >= 1 && (anCountMap[targetPai] || 0) >= 1 && (anCountMap[next] || 0) >= 1) {
    console.log('✅ 有足够的牌组成顺子');
    
    // 使用顺子后剩下的牌
    var tmpMap = {};
    for (var k in anCountMap) {
        tmpMap[k] = anCountMap[k];
    }
    tmpMap[prev]--;
    tmpMap[targetPai]--;
    tmpMap[next]--;
    if (tmpMap[prev] == 0) delete tmpMap[prev];
    if (tmpMap[targetPai] == 0) delete tmpMap[targetPai];
    if (tmpMap[next] == 0) delete tmpMap[next];
    
    console.log('\n使用(5-6-7)条顺子后剩下的牌:');
    var remainingTotal = 0;
    for (var k in tmpMap) {
        console.log('  ' + k + ': ' + tmpMap[k]);
        remainingTotal += tmpMap[k];
    }
    console.log('总张数:', remainingTotal);
    console.log('需要组成:', neededMianziCount - 1, '个面子 + 1个将');
    console.log('即', (neededMianziCount - 1) * 3 + 2, '张牌');
    
    // 检查能否组成 n-1 面子 + 1将
    function canFormNMianziAnd1Jiang(countMap, n) {
        var totalCount = 0;
        for (var k in countMap) {
            totalCount += countMap[k];
        }
        
        console.log('  canFormNMianziAnd1Jiang: 总张数=' + totalCount + ', 需要=' + (3 * n + 2));
        
        if (totalCount !== 3 * n + 2) {
            console.log('  ❌ 张数不对');
            return false;
        }
        
        for (var jiang in countMap) {
            jiang = parseInt(jiang);
            if (countMap[jiang] < 2) {
                continue;
            }
            
            var testMap = {};
            for (var k in countMap) {
                testMap[k] = countMap[k];
            }
            testMap[jiang] -= 2;
            if (testMap[jiang] == 0) {
                delete testMap[jiang];
            }
            
            console.log('  尝试将牌:', jiang, '剩下:', JSON.stringify(testMap));
            
            if (canFormNMianzi(testMap, n)) {
                console.log('  ✅ 找到');
                return true;
            }
        }
        
        console.log('  ❌ 找不到');
        return false;
    }
    
    function canFormNMianzi(countMap, n) {
        var totalCount = 0;
        for (var k in countMap) {
            totalCount += countMap[k];
        }
        
        if (totalCount === 0) {
            return n === 0;
        }
        
        if (totalCount !== 3 * n) {
            return false;
        }
        
        var firstPai = null;
        for (var k in countMap) {
            if (countMap[k] > 0) {
                firstPai = parseInt(k);
                break;
            }
        }
        
        if (firstPai == null) {
            return n === 0;
        }
        
        var firstCount = countMap[firstPai];
        
        if (firstCount >= 3) {
            var testMap = {};
            for (var k in countMap) {
                testMap[k] = countMap[k];
            }
            testMap[firstPai] -= 3;
            if (testMap[firstPai] == 0) delete testMap[firstPai];
            if (canFormNMianzi(testMap, n - 1)) {
                return true;
            }
        }
        
        if (firstPai < 27) {
            var v = firstPai % 9;
            if (v <= 6) {
                var next1 = firstPai + 1;
                var next2 = firstPai + 2;
                if (next2 < 27) {
                    var count1 = countMap[next1] || 0;
                    var count2 = countMap[next2] || 0;
                    if (count1 >= 1 && count2 >= 1) {
                        var testMap = {};
                        for (var k in countMap) {
                            testMap[k] = countMap[k];
                        }
                        testMap[firstPai]--;
                        testMap[next1]--;
                        testMap[next2]--;
                        if (testMap[firstPai] == 0) delete testMap[firstPai];
                        if (testMap[next1] == 0) delete testMap[next1];
                        if (testMap[next2] == 0) delete testMap[next2];
                        if (canFormNMianzi(testMap, n - 1)) {
                            return true;
                        }
                    }
                }
            }
        }
        
        return false;
    }
    
    console.log('\n检查剩下的牌能否组成' + (neededMianziCount - 1) + '面子+1将:');
    var result = canFormNMianziAnd1Jiang(tmpMap, neededMianziCount - 1);
    console.log('结果:', result ? '✅ 可以' : '❌ 不可以');
    
} else {
    console.log('❌ 没有足够的牌组成顺子');
}
