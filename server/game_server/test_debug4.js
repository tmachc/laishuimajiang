// 调试 canAllBeMianzi
console.log('========== 调试 canAllBeMianzi ==========');

// 使用(5-6-7)顺子后剩下的牌
var countMap = {
    '4': 1,  // 5筒
    '5': 1,  // 6筒
    '6': 1,  // 7筒
    '13': 1, // 5条（用了1张做顺子，手牌原本1张，所以剩0？不对）
    '14': 0, // 6条（胡的牌，用了1张做顺子）
    '15': 0, // 7条（用了1张做顺子）
    '16': 2, // 8条
    '17': 3, // 9条
    '26': 4  // 9万
};

// 等等，让我重新计算
// 原始所有牌（含胡牌）：
// 5筒(4):1, 6筒(5):1, 7筒(6):1
// 5条(13):1, 6条(14):1, 7条(15):1, 8条(16):2
// 9条(17):3, 9万(26):4

// 使用(5-6-7)条顺子后：
// 5筒(4):1, 6筒(5):1, 7筒(6):1
// 5条(13):0, 6条(14):0, 7条(15):0, 8条(16):2
// 9条(17):3, 9万(26):4

var remainingMap = {
    '4': 1,
    '5': 1,
    '6': 1,
    '16': 2,
    '17': 3,
    '26': 4
};

console.log('使用(5-6-7)条顺子后剩下的牌:');
var total = 0;
for (var k in remainingMap) {
    var id = parseInt(k);
    var name = '';
    if (id >= 0 && id <= 8) name = (id + 1) + '筒';
    else if (id >= 9 && id <= 17) name = (id - 8) + '条';
    else if (id >= 18 && id <= 26) name = (id - 17) + '万';
    console.log('  ' + name + '(' + k + '): ' + remainingMap[k] + '张');
    total += remainingMap[k];
}
console.log('总张数:', total);

// canAllBeMianzi 需要总张数是3的倍数
console.log('\n总张数 % 3 =', total % 3);
console.log('应该是0才能组成面子');

// 问题找到了！
// 总张数是 1+1+1+2+3+4 = 12张
// 12 % 3 = 0，应该可以组成面子
// 但之前的调试显示返回false

// 让我手动检查 canAllBeMianzi
function canAllBeMianzi(countMap){
    var totalCount = 0;
    for(var k in countMap){
        totalCount += countMap[k];
    }
    
    console.log('  canAllBeMianzi: 总张数=' + totalCount);
    
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
    
    console.log('  第一张牌:', firstPai, '数量:', countMap[firstPai]);
    
    var firstCount = countMap[firstPai];
    
    // 尝试刻子
    if(firstCount >= 3){
        console.log('  尝试刻子...');
        var tmpMap = {};
        for(var k in countMap){
            tmpMap[k] = countMap[k];
        }
        tmpMap[firstPai] -= 3;
        if(tmpMap[firstPai] == 0) delete tmpMap[firstPai];
        if(canAllBeMianzi(tmpMap)) return true;
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
                console.log('  尝试顺子(' + firstPai + '-' + next1 + '-' + next2 + '):', count1, count2);
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
    
    console.log('  无法组成面子');
    return false;
}

console.log('\n检查 canAllBeMianzi:');
var result = canAllBeMianzi(remainingMap);
console.log('结果:', result ? '可以' : '不可以');
