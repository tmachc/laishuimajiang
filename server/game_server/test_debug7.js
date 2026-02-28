// 调试 canBeJiangInAnyPattern
console.log('========== 调试 canBeJiangInAnyPattern ==========');

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

// 检查6条是否可以作为将
console.log('\n检查6条作为将:');
console.log('6条数量:', anCountMap[targetPai]);

if (anCountMap[targetPai] >= 2) {
    console.log('✅ 6条数量>=2，可以做将');
    
    // 使用6条做将后剩下的牌
    var tmpMap = {};
    for (var k in anCountMap) {
        tmpMap[k] = anCountMap[k];
    }
    tmpMap[targetPai] -= 2;
    if (tmpMap[targetPai] == 0) delete tmpMap[targetPai];
    
    console.log('\n使用6条做将后剩下的牌:');
    var remainingTotal = 0;
    for (var k in tmpMap) {
        console.log('  ' + k + ': ' + tmpMap[k]);
        remainingTotal += tmpMap[k];
    }
    console.log('总张数:', remainingTotal);
    console.log('需要组成:', neededMianziCount, '个面子');
    console.log('即', neededMianziCount * 3, '张牌');
    
    // 检查能否组成 n 个面子
    function canFormNMianzi(countMap, n) {
        var totalCount = 0;
        for (var k in countMap) {
            totalCount += countMap[k];
        }
        
        console.log('  canFormNMianzi: 总张数=' + totalCount + ', 需要=' + (3 * n));
        
        if (totalCount === 0) {
            return n === 0;
        }
        
        if (totalCount !== 3 * n) {
            console.log('  ❌ 张数不对');
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
        
        console.log('  第一张牌:', firstPai);
        
        var firstCount = countMap[firstPai];
        
        if (firstCount >= 3) {
            console.log('  尝试刻子...');
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
                    console.log('  尝试顺子(' + firstPai + '-' + next1 + '-' + next2 + '):', count1, count2);
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
        
        console.log('  ❌ 无法组成');
        return false;
    }
    
    console.log('\n检查剩下的牌能否组成' + neededMianziCount + '个面子:');
    var result = canFormNMianzi(tmpMap, neededMianziCount);
    console.log('结果:', result ? '✅ 可以' : '❌ 不可以');
    
} else {
    console.log('❌ 6条数量<2，不能做将');
}
