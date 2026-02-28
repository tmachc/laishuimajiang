var mjutils = require('./mjutils');

// 牌的编号：筒 0-8, 条 9-17, 万 18-26, 字牌 27-33
function paiName(p) {
    if (p < 9) return (p + 1) + '筒';
    if (p < 18) return (p - 8) + '条';
    if (p < 27) return (p - 17) + '万';
    if (p == 27) return '东';
    if (p == 28) return '南';
    return '字' + p;
}

function debugKanHu(name, holds, pengs, angangs, diangangs, wangangs, targetPai) {
    var seatData = {
        holds: holds,
        pengs: pengs || [],
        angangs: angangs || [],
        diangangs: diangangs || [],
        wangangs: wangangs || [],
        chis: [],
        countMap: {},
        que: 3,
        tingMap: {}
    };

    for (var i = 0; i < holds.length; i++) {
        var pai = holds[i];
        seatData.countMap[pai] = (seatData.countMap[pai] || 0) + 1;
    }

    console.log('=== ' + name + ' ===');
    console.log('手牌(' + holds.length + '张): ' + holds.map(paiName).join(' '));
    if (pengs && pengs.length > 0) console.log('碰: ' + pengs.map(paiName).join(' '));
    if (diangangs && diangangs.length > 0) console.log('明杠: ' + diangangs.map(paiName).join(' '));
    console.log('胡: ' + paiName(targetPai));
    console.log('');

    // 手动计算
    var mingMianziCount = 0;
    if (pengs) mingMianziCount += pengs.length / 3;
    if (diangangs) mingMianziCount += diangangs.length / 4;
    if (angangs) mingMianziCount += angangs.length / 4;
    if (wangangs) mingMianziCount += wangangs.length / 4;
    
    console.log('明面子数: ' + mingMianziCount);
    console.log('需要暗面子数: ' + (4 - mingMianziCount));
    
    // 创建 anCountMap
    var anCountMap = {};
    for (var k in seatData.countMap) {
        anCountMap[k] = seatData.countMap[k];
    }
    anCountMap[targetPai] = (anCountMap[targetPai] || 0) + 1;
    
    console.log('胡牌后暗牌统计:');
    for (var k in anCountMap) {
        console.log('  ' + paiName(parseInt(k)) + ': ' + anCountMap[k] + '张');
    }
    console.log('');

    // 调用实际函数
    var result = mjutils.checkKanHu(seatData, targetPai);
    console.log('结果: ' + result);
    console.log('');
    
    return result;
}

// 测试9: 2 2 2 2筒（明杠）4 5 6 7 7筒 2 3 4 6 8条，胡7条，对
debugKanHu('测试9: 明杠2222筒+45677筒+23468条，胡7条',
    [3,4,5,6,6, 10,11,12,14,16],  // 4,5,6,7,7筒 + 2,3,4,6,8条
    null, null, [1], null,  // 明杠2筒
    15);  // 胡7条

// 测试10: 南南南（碰）5 5条 1 2 3 3 4 5 5 7万，胡6万，对
debugKanHu('测试10: 碰南+55条+12334557万，胡6万',
    [13,13, 18,19,20,20,21,22,22,24],  // 5,5条 + 1,2,3,3,4,5,5,7万
    [28],  // 碰南
    null, null, null,
    23);  // 胡6万
