// 测试特定坎胡用例
var mjutils = require('./mjutils');

// 牌ID映射
// 筒子: 0-8 (1筒-9筒)
// 条子: 9-17 (1条-9条)  
// 万子: 18-26 (1万-9万)

// 测试用例：
// 999条（碰）999万（碰）567筒5788条，自摸6条
// 9条 = 17, 9万 = 26, 5筒 = 4, 6筒 = 5, 7筒 = 6
// 5条 = 13, 7条 = 15, 8条 = 16, 6条 = 14

var holds = [4, 5, 6, 13, 15, 16, 16]; // 567筒 + 5788条
var pengs = [17, 17, 17, 26, 26, 26]; // 999条 + 999万
var targetPai = 14; // 6条

console.log('========== 测试用例 ==========');
console.log('手牌（暗牌）:', holds.map(id => {
    if (id >= 0 && id <= 8) return (id + 1) + '筒';
    if (id >= 9 && id <= 17) return (id - 8) + '条';
    if (id >= 18 && id <= 26) return (id - 17) + '万';
    return '?';
}));
console.log('碰牌:', '9条x3, 9万x3');
console.log('自摸:', '6条');

// 创建seatData（不包含碰牌在countMap中，模拟实际游戏数据结构）
var countMap = {};
for (var i = 0; i < holds.length; i++) {
    var pai = holds[i];
    countMap[pai] = (countMap[pai] || 0) + 1;
}

var seatData = {
    holds: holds,
    countMap: countMap,
    tingMap: {},
    pengs: pengs
};

console.log('\n--- 手牌countMap（不含碰牌） ---');
for (var k in countMap) {
    var id = parseInt(k);
    var name = '';
    if (id >= 0 && id <= 8) name = (id + 1) + '筒';
    else if (id >= 9 && id <= 17) name = (id - 8) + '条';
    else if (id >= 18 && id <= 26) name = (id - 17) + '万';
    console.log('  ' + name + ': ' + countMap[k] + '张');
}

// 使用checkTingPai检查听牌
console.log('\n--- 检查听牌 ---');
mjutils.checkTingPai(seatData, 9, 18); // 检查条子（9-17）

console.log('听牌结果:');
for (var k in seatData.tingMap) {
    var id = parseInt(k);
    var name = (id - 8) + '条';
    console.log('  可以胡: ' + name);
}

// 检查是否可以胡6条
if (seatData.tingMap[targetPai]) {
    console.log('\n✅ 可以胡6条！');
} else {
    console.log('\n❌ 不能胡6条');
}

// 详细分析
console.log('\n--- 胡牌结构分析 ---');
console.log('碰牌: 9条刻子(3张), 9万刻子(3张)');
console.log('暗牌: 567筒(3张), 5788条(4张)');
console.log('自摸6条后:');
console.log('  - 567筒顺子');
console.log('  - 567条顺子（5条+6条+7条）');
console.log('  - 88条将');
console.log('  - 9条刻子（碰）');
console.log('  - 9万刻子（碰）');
console.log('结构: 4面子 + 1将 ✅');
