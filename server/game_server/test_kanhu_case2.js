// 测试更多坎胡用例
var mjutils = require('./mjutils');

// 牌ID映射
// 筒子: 0-8 (1筒-9筒)
// 条子: 9-17 (1条-9条)  
// 万子: 18-26 (1万-9万)

function testCase(name, holds, pengs, wangangs, chis, targetPai, expected) {
    // 创建seatData（不包含碰牌/杠牌/吃牌在countMap中）
    var countMap = {};
    for (var i = 0; i < holds.length; i++) {
        var pai = holds[i];
        countMap[pai] = (countMap[pai] || 0) + 1;
    }

    var seatData = {
        holds: holds,
        countMap: countMap,
        tingMap: {},
        pengs: pengs || [],
        wangangs: wangangs || [],
        chis: chis || []
    };

    // 使用checkTingPai检查听牌
    mjutils.checkTingPai(seatData, 9, 18); // 检查条子（9-17）

    var canHu = seatData.tingMap[targetPai] != null;
    var result = canHu === expected ? '✅' : '❌';
    
    console.log('\n========== ' + name + ' ==========');
    console.log('手牌:', holds.map(id => {
        if (id >= 0 && id <= 8) return (id + 1) + '筒';
        if (id >= 9 && id <= 17) return (id - 8) + '条';
        if (id >= 18 && id <= 26) return (id - 17) + '万';
        return '?';
    }).join(','));
    if (pengs && pengs.length > 0) {
        console.log('碰牌:', pengs.map(id => (id - 8) + '条').join(','));
    }
    if (wangangs && wangangs.length > 0) {
        console.log('杠牌:', wangangs.map(id => (id - 17) + '万').join(','));
    }
    if (chis && chis.length > 0) {
        console.log('吃牌:', chis.map(id => (id - 8) + '条').join(','));
    }
    console.log('自摸:', (targetPai - 8) + '条');
    console.log('预期:', expected ? '胡' : '不胡');
    console.log('实际:', canHu ? '胡' : '不胡');
    console.log('结果:', result);
    
    return canHu === expected;
}

// 测试用例1：999条（碰）9999万（杠）+ 567筒5788条，自摸6条
// 9条 = 17, 9万 = 26
// 5筒 = 4, 6筒 = 5, 7筒 = 6
// 5条 = 13, 7条 = 15, 8条 = 16, 6条 = 14
var holds1 = [4, 5, 6, 13, 15, 16, 16]; // 567筒 + 5788条
var pengs1 = [17, 17, 17]; // 999条碰
var wangangs1 = [26, 26, 26, 26]; // 9999万杠
var target1 = 14; // 6条

// 测试用例2：678条（吃）999万（碰）+ 567筒5788条，自摸6条
// 6条 = 15, 7条 = 16, 8条 = 17
// 9万 = 26
var holds2 = [4, 5, 6, 13, 15, 16, 16]; // 567筒 + 5788条
var chis2 = [15, 16, 17]; // 678条吃
var pengs2 = [26, 26, 26]; // 999万碰
var target2 = 14; // 6条

console.log('开始测试坎胡用例...\n');

var result1 = testCase('测试1：碰+杠', holds1, pengs1, wangangs1, null, target1, true);
var result2 = testCase('测试2：吃+碰', holds2, pengs2, null, chis2, target2, true);

console.log('\n========== 总结 ==========');
console.log('测试1（碰+杠）:', result1 ? '通过' : '失败');
console.log('测试2（吃+碰）:', result2 ? '通过' : '失败');
