// 详细检查 canBeRightEdgeInAnyPattern
console.log('========== 检查 canBeRightEdgeInAnyPattern ==========');

// 测试2的暗牌countMap（胡3筒后）
var anCountMap = {
    '0': 1,  // 1筒
    '1': 2,  // 2筒
    '2': 2,  // 3筒
    '3': 2,  // 4筒
    '4': 1,  // 5筒
    '5': 1,  // 6筒
    '6': 1,  // 7筒
    '7': 1,  // 8筒
    '8': 1,  // 9筒
    '19': 2  // 2万
};

var neededMianziCount = 4; // 没有明牌，需要4个面子
var targetPai = 2; // 3筒

console.log('暗牌countMap:');
for (var k in anCountMap) {
    var id = parseInt(k);
    var name = (id + 1) + '筒';
    if (id >= 18) name = (id - 17) + '万';
    console.log('  ' + name + '(' + k + '): ' + anCountMap[k]);
}

// 检查 (1-2-3) - 3筒作为右边缘
console.log('\n检查 (1-2-3) - 3筒作为右边缘:');
var prev2 = targetPai - 2; // 1筒
var prev1 = targetPai - 1; // 2筒

console.log('  1筒:', anCountMap[prev2] || 0);
console.log('  2筒:', anCountMap[prev1] || 0);
console.log('  3筒:', anCountMap[targetPai] || 0);

if ((anCountMap[prev2] || 0) >= 1 && (anCountMap[prev1] || 0) >= 1 && (anCountMap[targetPai] || 0) >= 1) {
    console.log('  ✅ 有足够的牌');
    
    // 使用(1-2-3)顺子后剩下的牌
    var tmpMap = {};
    for (var k in anCountMap) {
        tmpMap[k] = anCountMap[k];
    }
    tmpMap[prev2]--;
    tmpMap[prev1]--;
    tmpMap[targetPai]--;
    if (tmpMap[prev2] == 0) delete tmpMap[prev2];
    if (tmpMap[prev1] == 0) delete tmpMap[prev1];
    if (tmpMap[targetPai] == 0) delete tmpMap[targetPai];
    
    console.log('\n  使用(1-2-3)后剩下的牌:');
    var remainingTotal = 0;
    for (var k in tmpMap) {
        var id = parseInt(k);
        var name = (id + 1) + '筒';
        if (id >= 18) name = (id - 17) + '万';
        console.log('    ' + name + ': ' + tmpMap[k]);
        remainingTotal += tmpMap[k];
    }
    console.log('    总张数:', remainingTotal);
    console.log('    需要组成:', neededMianziCount - 1, '个面子 + 1个将');
    console.log('    即', (neededMianziCount - 1) * 3 + 2, '张牌');
    
    // 检查能否组成 n-1 面子 + 1将
    function canFormNMianziAnd1Jiang(countMap, n) {
        var totalCount = 0;
        for (var k in countMap) {
            totalCount += countMap[k];
        }
        
        console.log('    canFormNMianziAnd1Jiang: 总张数=' + totalCount + ', 需要=' + (3 * n + 2));
        
        if (totalCount !== 3 * n + 2) {
            console.log('    ❌ 张数不对');
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
            
            if (canFormNMianzi(testMap, n)) {
                console.log('    ✅ 找到将牌:', jiang);
                return true;
            }
        }
        
        console.log('    ❌ 找不到');
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
    
    var result = canFormNMianziAnd1Jiang(tmpMap, neededMianziCount - 1);
    console.log('\n  结果:', result ? '✅ 可以' : '❌ 不可以');
} else {
    console.log('  ❌ 没有足够的牌');
}
