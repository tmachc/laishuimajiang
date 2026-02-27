var nameMap = {
	[0]:'1筒',[1]:'2筒',[2]:'3筒',[3]:'4筒',[4]:'5筒',[5]:'6筒',[6]:'7筒',[7]:'8筒',[8]:'9筒',
	[9]:'1条',[10]:'2条',[11]:'3条',[12]:'4条',[13]:'5条',[14]:'6条',[15]:'7条',[16]:'8条',[17]:'9条',
	[18]:'1万',[19]:'2万',[20]:'3万',[21]:'4万',[22]:'5万',[23]:'6万',[24]:'7万',[25]:'8万',[26]:'9万',
}

function getMJType(id){
    if(id >= 0 && id < 9){
        return 0;
    }
    else if(id >= 9 && id < 18){
        return 1;
    }
    else if(id >= 18 && id < 27){
        return 2;
    }
}

function isSameType(pai1, pai2){
    return getMJType(pai1) == getMJType(pai2);
}

function checkKanHu(seatData, targetPai){
    var canBeMiddle = checkCanBeMiddle(seatData, targetPai);
    if(!canBeMiddle){
        return false;
    }
    
    var canBeJiang = checkCanBeJiang(seatData, targetPai);
    if(canBeJiang){
        return false;
    }
    
    var canBeLeftEdge = checkCanBeLeftEdge(seatData, targetPai);
    if(canBeLeftEdge){
        return false;
    }
    
    var canBeRightEdge = checkCanBeRightEdge(seatData, targetPai);
    if(canBeRightEdge){
        return false;
    }
    
    var canBeKezi = checkCanBeKezi(seatData, targetPai);
    if(canBeKezi){
        return false;
    }
    
    return true;
}

function checkCanBeMiddle(seatData, targetPai){
    var v = targetPai % 9;
    if(v < 1 || v > 7){
        return false;
    }
    
    var prev = targetPai - 1;
    var next = targetPai + 1;
    
    if(!isSameType(targetPai, prev) || !isSameType(targetPai, next)){
        return false;
    }
    
    var prevCount = seatData.countMap[prev] || 0;
    var nextCount = seatData.countMap[next] || 0;
    
    return prevCount >= 1 && nextCount >= 1;
}

function checkCanBeJiang(seatData, targetPai){
    var count = seatData.countMap[targetPai] || 0;
    return count >= 1;
}

function checkCanBeLeftEdge(seatData, targetPai){
    var v = targetPai % 9;
    if(v > 6){
        return false;
    }
    
    var next1 = targetPai + 1;
    var next2 = targetPai + 2;
    
    if(!isSameType(targetPai, next1) || !isSameType(targetPai, next2)){
        return false;
    }
    
    var count1 = seatData.countMap[next1] || 0;
    var count2 = seatData.countMap[next2] || 0;
    
    return count1 >= 1 && count2 >= 1;
}

function checkCanBeRightEdge(seatData, targetPai){
    var v = targetPai % 9;
    if(v < 2){
        return false;
    }
    
    var prev1 = targetPai - 1;
    var prev2 = targetPai - 2;
    
    if(!isSameType(targetPai, prev1) || !isSameType(targetPai, prev2)){
        return false;
    }
    
    var count1 = seatData.countMap[prev1] || 0;
    var count2 = seatData.countMap[prev2] || 0;
    
    return count1 >= 1 && count2 >= 1;
}

function checkCanBeKezi(seatData, targetPai){
    var count = seatData.countMap[targetPai] || 0;
    return count >= 2;
}

function testKanHu(name, holds, targetPai, expected){
	var seatData = {
		holds: holds,
		countMap: {},
	}
	
	for(var i = 0; i < holds.length; ++i){
		var pai = holds[i];
		if(seatData.countMap[pai] == null){
			seatData.countMap[pai] = 1;
		}
		else{
			seatData.countMap[pai] ++;
		}
	}
	
	var result = checkKanHu(seatData, targetPai);
	var status = result === expected ? "✓ PASS" : "✗ FAIL";
	
	var holdsStr = holds.map(function(p){ return nameMap[p]; }).join(",");
	console.log(status + " | " + name);
	console.log("  手牌: [" + holdsStr + "]");
	console.log("  胡牌: " + nameMap[targetPai]);
	console.log("  预期: " + (expected ? "可以坎胡" : "不能坎胡"));
	console.log("  结果: " + (result ? "可以坎胡" : "不能坎胡"));
	console.log("");
	
	return result === expected;
}

console.log("========== 坎胡算法测试 ==========\n");

var passCount = 0;
var totalCount = 0;

totalCount++;
if(testKanHu("标准坎胡", [1, 3], 2, true)) passCount++;

totalCount++;
if(testKanHu("标准坎胡-万", [18, 20], 19, true)) passCount++;

totalCount++;
if(testKanHu("标准坎胡-条", [9, 11], 10, true)) passCount++;

totalCount++;
if(testKanHu("情况a: 2334胡3-可作为将牌", [1, 2, 2, 3], 2, false)) passCount++;

totalCount++;
if(testKanHu("情况b: 2234455胡3-可作为边张", [1, 1, 2, 3, 4, 4], 2, false)) passCount++;

totalCount++;
if(testKanHu("情况c: 2224胡4-可作为将牌", [1, 1, 1, 3], 3, false)) passCount++;

totalCount++;
if(testKanHu("情况d: 23345胡1-可作为边张", [0, 1, 2, 2, 3], 0, false)) passCount++;

totalCount++;
if(testKanHu("情况d: 23345胡4-可作为边张", [0, 1, 2, 2, 3], 3, false)) passCount++;

totalCount++;
if(testKanHu("情况c变体: 2224胡2-可作为刻子", [1, 1, 1, 3], 1, false)) passCount++;

totalCount++;
if(testKanHu("边张不能坎胡-胡1", [1, 2], 0, false)) passCount++;

totalCount++;
if(testKanHu("边张不能坎胡-胡3", [1, 2], 2, false)) passCount++;

totalCount++;
if(testKanHu("1筒和3筒可以坎胡2筒", [0, 2], 1, true)) passCount++;

totalCount++;
if(testKanHu("7筒和9筒可以坎胡8筒", [6, 8], 7, true)) passCount++;

totalCount++;
if(testKanHu("跨花色不能坎胡", [1, 10], 2, false)) passCount++;

console.log("========== 测试结果 ==========");
console.log("通过: " + passCount + "/" + totalCount);
console.log("失败: " + (totalCount - passCount) + "/" + totalCount);
