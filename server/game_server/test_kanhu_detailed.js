// 详细调试坎胡算法
var mjutils = require('./mjutils');

// 测试用例1：999条（碰）9999万（杠）+ 567筒5788条，自摸6条
var holds = [4, 5, 6, 13, 15, 16, 16]; // 567筒 + 5788条
var pengs = [17, 17, 17]; // 999条碰
var gangs = [26, 26, 26, 26]; // 9999万杠
var targetPai = 14; // 6条

// 创建完整的countMap
var countMap = {};
for (var i = 0; i < holds.length; i++) {
    var pai = holds[i];
    countMap[pai] = (countMap[pai] || 0) + 1;
}
for (var i = 0; i < pengs.length; i++) {
    var pai = pengs[i];
    countMap[pai] = (countMap[pai] || 0) + 1;
}
for (var i = 0; i < gangs.length; i++) {
    var pai = gangs[i];
    countMap[pai] = (countMap[pai] || 0) + 1;
}

console.log('========== 详细调试 ==========');
console.log('胡牌前countMap:');
for (var k in countMap) {
    var id = parseInt(k);
    var name = '';
    if (id >= 0 && id <= 8) name = (id + 1) + '筒';
    else if (id >= 9 && id <= 17) name = (id - 8) + '条';
    else if (id >= 18 && id <= 26) name = (id - 17) + '万';
    console.log('  ' + name + '(' + k + '): ' + countMap[k] + '张');
}

// 胡牌后的countMap
var tmpCountMap = {};
for (var k in countMap) {
    tmpCountMap[k] = countMap[k];
}
tmpCountMap[targetPai] = (tmpCountMap[targetPai] || 0) + 1;

console.log('\n胡6条后countMap:');
var total = 0;
for (var k in tmpCountMap) {
    var id = parseInt(k);
    var name = '';
    if (id >= 0 && id <= 8) name = (id + 1) + '筒';
    else if (id >= 9 && id <= 17) name = (id - 8) + '条';
    else if (id >= 18 && id <= 26) name = (id - 17) + '万';
    console.log('  ' + name + '(' + k + '): ' + tmpCountMap[k] + '张');
    total += tmpCountMap[k];
}
console.log('总张数:', total, '(应该是14张，胡牌后应该是14张，但这里显示15张)');

console.log('\n========== 问题分析 ==========');
console.log('当前算法把所有牌混在一起计算（手牌+碰牌+杠牌+胡牌）');
console.log('但碰牌和杠牌已经是明面子了，不应该参与暗牌的胡牌计算');
console.log('');
console.log('正确的逻辑:');
console.log('- 明牌: 9条刻子(碰), 9万刻子(杠) = 2个面子');
console.log('- 暗牌需要组成: 2个面子 + 1个将');
console.log('- 暗牌+6条: 567筒, 56788条');
console.log('- 可以组成: 567筒顺 + 567条顺 + 88条将 ✅');
