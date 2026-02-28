// 直接使用 checkKanHu 调试
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

console.log('========== 直接使用 checkKanHu ==========');
console.log('手牌:', holds);
console.log('碰牌:', pengs);
console.log('杠牌:', gangs);
console.log('targetPai:', targetPai);

var result = mjutils.checkKanHu(seatData, targetPai);
console.log('\n结果:', result ? '✅ 是坎胡' : '❌ 不是坎胡');
