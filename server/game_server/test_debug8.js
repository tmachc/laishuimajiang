// 调试 canBeKeziInAnyPattern
console.log('========== 调试 canBeKeziInAnyPattern ==========');

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

// 检查6条是否可以作为刻子
console.log('\n检查6条作为刻子:');
console.log('6条数量:', anCountMap[targetPai]);

if (anCountMap[targetPai] >= 3) {
    console.log('✅ 6条数量>=3，可以做刻子');
} else {
    console.log('❌ 6条数量<3，不能做刻子');
}

// 检查6条是否可以作为左边缘 (6-7-8)
console.log('\n检查6条作为左边缘(6-7-8):');
var next1 = targetPai + 1; // 7条 = 15
var next2 = targetPai + 2; // 8条 = 16
console.log('6条:', anCountMap[targetPai] || 0);
console.log('7条:', anCountMap[next1] || 0);
console.log('8条:', anCountMap[next2] || 0);

if ((anCountMap[targetPai] || 0) >= 1 && (anCountMap[next1] || 0) >= 1 && (anCountMap[next2] || 0) >= 1) {
    console.log('✅ 有足够的牌组成顺子(6-7-8)');
} else {
    console.log('❌ 没有足够的牌组成顺子(6-7-8)');
}

// 检查6条是否可以作为右边缘 (4-5-6)
console.log('\n检查6条作为右边缘(4-5-6):');
var prev2 = targetPai - 2; // 4条 = 12
var prev1 = targetPai - 1; // 5条 = 13
console.log('4条:', anCountMap[prev2] || 0);
console.log('5条:', anCountMap[prev1] || 0);
console.log('6条:', anCountMap[targetPai] || 0);

if ((anCountMap[prev2] || 0) >= 1 && (anCountMap[prev1] || 0) >= 1 && (anCountMap[targetPai] || 0) >= 1) {
    console.log('✅ 有足够的牌组成顺子(4-5-6)');
} else {
    console.log('❌ 没有足够的牌组成顺子(4-5-6)');
}

console.log('\n========== 总结 ==========');
console.log('6条作为将: ❌ (数量<2)');
console.log('6条作为刻子: ❌ (数量<3)');
console.log('6条作为左边缘(6-7-8): ✅ (但需检查剩下的牌能否组成面子)');
console.log('6条作为右边缘(4-5-6): ❌ (4条不存在)');
console.log('6条作为中间(5-6-7): ✅ (已验证)');
